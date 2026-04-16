import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Order, OrderDocument } from './schema/order.schema';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { OrderStatus, PaymentStatus } from './enum/order.enums';
import { FullProductWithTranslations } from '../product/interface/product.interface';

/** Сума замовлення, починаючи з якої доставка безкоштовна */
const FREE_SHIPPING_THRESHOLD = 2000;

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private cartService: CartService,
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

    return order;
  }

  // ─── Адмін-методи ───────────────────────────────────────────────────────────

  async markAsPaid(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    order.paymentStatus = PaymentStatus.PAID;
    order.status = OrderStatus.PROCESSING;
    await order.save();

    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    await order.save();

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
}
