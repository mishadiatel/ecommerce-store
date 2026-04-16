import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { Order, OrderDocument } from './schema/order.schema';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { OrderStatus, PaymentStatus } from './enum/order.enums';
import { FullProductWithTranslations } from '../product/interface/product.interface';
import { TelegramService } from '../telegram/telegram.service';
import { MailService } from '../mail/mail.service';

/** Сума замовлення, починаючи з якої доставка безкоштовна */
const FREE_SHIPPING_THRESHOLD = 2000;

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private cartService: CartService,
    private telegramService: TelegramService,
    private mailService: MailService,
  ) {}

  // ─── Генерація номера замовлення ────────────────────────────────────────────

  private generateOrderNumber(): string {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(100000 + Math.random() * 900000);
    return `ORD-${y}${m}${d}-${random}`;
  }

  // ─── Підрахунок сум ─────────────────────────────────────────────────────────

  private calculateTotals(
    cartItems: Array<{ quantity: number; product: FullProductWithTranslations }>,
  ) {
    let subtotal = 0;
    let discount = 0;

    for (const i of cartItems) {
      const price = i.product.newPrice;
      const old = i.product.oldPrice ?? price;

      subtotal += old * i.quantity;
      discount += (old - price) * i.quantity;
    }

    const total = subtotal - discount;

    const hasFreeDelivery = total >= FREE_SHIPPING_THRESHOLD;

    return { subtotal, discount, total, hasFreeDelivery };
  }

  // ─── Отримати назву продукту з перекладів ───────────────────────────────────

  private getProductName(product: FullProductWithTranslations): string {
    // Пріоритет: ua → en → перший доступний → slug
    const ua = product.translations.find((t) => t.lang === 'ua');
    if (ua?.title) return ua.title;

    const en = product.translations.find((t) => t.lang === 'en');
    if (en?.title) return en.title;

    return product.translations[0]?.title ?? product.slug;
  }

  // ─── Створення замовлення ────────────────────────────────────────────────────

  async createOrder(user: JwtUser | null, dto: CreateOrderDto) {
    const cart = await this.cartService.getCart(user, dto.guestId);

    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    // Підрахунок сум — передаємо cart.items з повними об'єктами продуктів
    const { subtotal, discount, total, hasFreeDelivery } =
      this.calculateTotals(cart.items);

    // Маппінг позицій для збереження в БД
    const items = cart.items.map((i) => ({
      productId: i.product._id.toString(),
      name: this.getProductName(i.product),
      price: i.product.newPrice,
      oldPrice: i.product.oldPrice ?? i.product.newPrice,
      quantity: i.quantity,
    }));

    const order = await this.orderModel.create({
      orderNumber: this.generateOrderNumber(),

      // Прив'язка до користувача або гостя
      userId: user ? new Types.ObjectId(user.sub) : null,
      guestId: user ? null : (dto.guestId ?? null),

      items,

      // Фінансові суми
      subtotal,
      discount,
      total,
      hasFreeDelivery,

      // Метод оплати та статуси
      paymentMethod: dto.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.PENDING,

      // Контактні дані замовника
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,

      // Дані для іншого отримувача
      orderForAnotherPerson: dto.orderForAnotherPerson,
      anotherFirstName: dto.anotherFirstName,
      anotherLastName: dto.anotherLastName,
      anotherEmail: dto.anotherEmail,
      anotherPhoneNumber: dto.anotherPhoneNumber,

      // Доставка
      deliveryType: dto.deliveryType,
      deliveryCity: dto.deliveryCity,
      deliveryWarehouse: dto.deliveryWarehouse,

      // Додатково
      message: dto.message,
      dontCallMe: dto.dontCallMe,
      isAgree: dto.isAgree,
    });

    await this.clearCart(user, dto.guestId);

    // ─── Нотифікації (не блокуємо відповідь) ──────────────────────────────
    void this.notifyOrderCreated(order);
    if (order.email) {
      void this.mailService
        .sendOrderCreatedEmail({
          email: order.email,
          orderNumber: order.orderNumber,
          firstName: order.firstName,
          total: order.total,
        })
        .catch((err: unknown) => {
          this.logger.error(
            `Failed to send order-created email: ${(err as Error).message}`,
          );
        });
    }

    return order;
  }

  // ─── Адмін-методи ───────────────────────────────────────────────────────────

  async findAllOrdersAdmin(query: OrderQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<OrderDocument> = {};

    /* 🔍 SEARCH — за номером замовлення, email або телефоном */
    if (query.search) {
      const search = query.search.trim();
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { orderNumber: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { phoneNumber: { $regex: safeSearch, $options: 'i' } },
        { firstName: { $regex: safeSearch, $options: 'i' } },
        { lastName: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.paymentStatus) {
      filter.paymentStatus = query.paymentStatus;
    }

    const sortOrder: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      totalDocuments: total,
      totalPages,
    };
  }

  async findOrderById(orderId: string) {
    const order = await this.orderModel.findById(orderId).lean();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async markAsPaid(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const previousStatus = order.status;

    order.paymentStatus = PaymentStatus.PAID;
    order.status = OrderStatus.PROCESSING;
    await order.save();

    // Нотифікуємо про оплату
    void this.telegramService.sendMessage({
      text: this.buildOrderPaidTelegramMessage(order),
    });

    if (order.email) {
      void this.mailService
        .sendOrderPaidEmail({
          email: order.email,
          orderNumber: order.orderNumber,
          firstName: order.firstName,
        })
        .catch((err: unknown) => {
          this.logger.error(
            `Failed to send order-paid email: ${(err as Error).message}`,
          );
        });

      // Якщо статус замовлення ще й змінився (pending → processing) —
      // окремо повідомляємо про зміну статусу
      if (previousStatus !== OrderStatus.PROCESSING) {
        void this.mailService
          .sendOrderStatusUpdatedEmail({
            email: order.email,
            orderNumber: order.orderNumber,
            firstName: order.firstName,
            status: order.status,
          })
          .catch((err: unknown) => {
            this.logger.error(
              `Failed to send order-status email: ${(err as Error).message}`,
            );
          });
      }
    }

    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // Якщо статус реально змінився — шлемо нотифікації
    if (previousStatus !== status) {
      void this.telegramService.sendMessage({
        text: this.buildOrderStatusTelegramMessage(order, previousStatus),
      });

      if (order.email) {
        void this.mailService
          .sendOrderStatusUpdatedEmail({
            email: order.email,
            orderNumber: order.orderNumber,
            firstName: order.firstName,
            status: order.status,
          })
          .catch((err: unknown) => {
            this.logger.error(
              `Failed to send order-status email: ${(err as Error).message}`,
            );
          });
      }
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    return this.orderModel.findOne({ orderNumber });
  }

  // ─── Приватні хелпери ────────────────────────────────────────────────────────

  private async clearCart(user: JwtUser | null, guestId?: string) {
    const cart = await this.cartService['findOrCreateCart'](user, guestId);
    cart.items = [];
    await cart.save();
  }

  /** Надіслати повідомлення в Telegram групу про новий заказ. */
  private async notifyOrderCreated(order: OrderDocument): Promise<void> {
    try {
      await this.telegramService.sendMessage({
        text: this.buildOrderCreatedTelegramMessage(order),
      });
    } catch (err) {
      this.logger.error(
        `Failed to send Telegram notification for new order: ${(err as Error).message}`,
      );
    }
  }

  private buildOrderCreatedTelegramMessage(order: OrderDocument): string {
    const esc = (v: unknown) => this.telegramService.escapeHtml(v as string);

    const itemsLines = order.items
      .map(
        (i, idx) =>
          `  ${idx + 1}. ${esc(i.name)} — ${i.quantity} × ${i.price}₴`,
      )
      .join('\n');

    const parts = [
      '🆕 <b>Нове замовлення</b>',
      `<b>№:</b> ${esc(order.orderNumber)}`,
      '',
      '<b>👤 Клієнт</b>',
      `${esc(order.firstName)} ${esc(order.lastName)}`,
      `📧 ${esc(order.email)}`,
      `📞 ${esc(order.phoneNumber)}`,
    ];

    if (order.orderForAnotherPerson) {
      parts.push(
        '',
        '<b>🎁 Отримувач</b>',
        `${esc(order.anotherFirstName)} ${esc(order.anotherLastName)}`,
        `📧 ${esc(order.anotherEmail)}`,
        `📞 ${esc(order.anotherPhoneNumber)}`,
      );
    }

    parts.push(
      '',
      '<b>🚚 Доставка</b>',
      `${esc(order.deliveryType)}`,
      `${esc(order.deliveryCity)}, ${esc(order.deliveryWarehouse)}`,
      '',
      '<b>🛒 Товари</b>',
      itemsLines,
      '',
      `<b>💰 Разом:</b> ${order.total}₴ (знижка ${order.discount}₴)`,
      `<b>💳 Оплата:</b> ${esc(order.paymentMethod)} / ${esc(order.paymentStatus)}`,
      `<b>📦 Статус:</b> ${esc(order.status)}`,
    );

    if (order.message) {
      parts.push('', `<b>💬 Коментар:</b> ${esc(order.message)}`);
    }

    return parts.join('\n');
  }

  private buildOrderStatusTelegramMessage(
    order: OrderDocument,
    previousStatus: string,
  ): string {
    const esc = (v: unknown) => this.telegramService.escapeHtml(v as string);
    return [
      '🔄 <b>Зміна статусу замовлення</b>',
      `<b>№:</b> ${esc(order.orderNumber)}`,
      `<b>Статус:</b> ${esc(previousStatus)} → <b>${esc(order.status)}</b>`,
      `<b>Клієнт:</b> ${esc(order.firstName)} ${esc(order.lastName)} (${esc(order.email)})`,
    ].join('\n');
  }

  private buildOrderPaidTelegramMessage(order: OrderDocument): string {
    const esc = (v: unknown) => this.telegramService.escapeHtml(v as string);
    return [
      '✅ <b>Замовлення оплачено</b>',
      `<b>№:</b> ${esc(order.orderNumber)}`,
      `<b>Сума:</b> ${order.total}₴`,
      `<b>Клієнт:</b> ${esc(order.firstName)} ${esc(order.lastName)} (${esc(order.email)})`,
    ].join('\n');
  }
}
