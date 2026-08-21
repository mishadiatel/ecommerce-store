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
import { OrderStatus, PaymentMethod, PaymentStatus } from './enum/order.enums';
import { FullProductWithTranslations } from '../product/interface/product.interface';
import { TelegramService } from '../telegram/telegram.service';
import { MailService } from '../mail/mail.service';
import { LiqPayService } from '../payments/liqpay/liqpay.service';
import { PromoCodeService } from '../promo-code/promo-code.service';

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
    private liqpayService: LiqPayService,
    private promoCodeService: PromoCodeService,
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
    cartItems: Array<{
      quantity: number;
      product: FullProductWithTranslations;
      effectivePrice?: number;
      effectiveOldPrice?: number;
    }>,
  ) {
    let subtotal = 0;
    let discount = 0;

    for (const i of cartItems) {
      const price = i.effectivePrice ?? i.product.newPrice;
      const old = i.effectiveOldPrice ?? i.product.oldPrice ?? price;

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
    const baseTotals = this.calculateTotals(cart.items);
    let { total, hasFreeDelivery } = baseTotals;
    const { subtotal, discount } = baseTotals;

    // ─── Промокод ──────────────────────────────────────────────────────────
    // Валідуємо промокод для поточної суми корзини.
    // validateForCart кидає BadRequestException з людським повідомленням,
    // якщо код невалідний — що автоматично транслюється в 400 для клієнта.
    let promoCodeDoc:
      | Awaited<ReturnType<PromoCodeService['validateForCart']>>['promoCode']
      | null = null;
    let promoCodeDiscountAmount = 0;

    if (dto.promoCode && dto.promoCode.trim()) {
      const validation = await this.promoCodeService.validateForCart(
        dto.promoCode,
        total,
      );
      promoCodeDoc = validation.promoCode;
      promoCodeDiscountAmount = validation.discountAmount;
      total = Math.max(0, total - promoCodeDiscountAmount);
      // Перераховуємо безкоштовну доставку ПІСЛЯ застосування промокоду —
      // уникаємо сюрпризів, коли замовлення після знижки падає нижче порога.
      hasFreeDelivery = total >= 2000;
    }

    // Маппінг позицій для збереження в БД
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = cart.items.map((i: any) => ({
      productId: i.product._id.toString(),
      name: this.getProductName(i.product),
      price: i.effectivePrice ?? i.product.newPrice,
      oldPrice: i.effectiveOldPrice ?? i.product.oldPrice ?? i.product.newPrice,
      quantity: i.quantity,
      variantSku: i.variantSku ?? null,
      variantName: i.variantName ?? '',
    }));

    // ─── Перевірка наявності через прапорець outOfStock ───────────────
    // Залишок (stock) — суто інформаційне поле і не декрементується.
    // Забороняємо тільки замовлення позицій, які адмін явно позначив
    // як "немає в наявності".
    for (const i of items) {
      const hasVariant = !!i.variantSku;
      const filter = hasVariant
        ? {
            _id: new Types.ObjectId(i.productId),
            'variants.sku': i.variantSku,
            'variants.outOfStock': true,
          }
        : {
            _id: new Types.ObjectId(i.productId),
            outOfStock: true,
          };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oosCount = await (this.orderModel.db.model('Product') as any).countDocuments(filter);
      if (oosCount > 0) {
        throw new BadRequestException(
          `"${i.name}${i.variantName ? ` (${i.variantName})` : ''}" is out of stock`,
        );
      }
    }

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

      // Промокод (якщо був застосований)
      promoCodeId: promoCodeDoc ? promoCodeDoc._id : null,
      promoCode: promoCodeDoc ? promoCodeDoc.code : null,
      promoCodeDiscountType: promoCodeDoc ? promoCodeDoc.discountType : null,
      promoCodeDiscountValue: promoCodeDoc ? promoCodeDoc.discountValue : null,
      promoCodeDiscountAmount,

      // Метод оплати та статуси
      paymentMethod: dto.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.PENDING,

      // Контактні дані замовника
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,

      // Дані для іншого отримувача — зберігаємо ТІЛЬКИ якщо прапорець true,
      // інакше не створюємо ці поля взагалі (null для MongoDB → відсутність).
      orderForAnotherPerson: dto.orderForAnotherPerson,
      anotherFirstName: dto.orderForAnotherPerson
        ? dto.anotherFirstName?.trim() || undefined
        : undefined,
      anotherLastName: dto.orderForAnotherPerson
        ? dto.anotherLastName?.trim() || undefined
        : undefined,
      anotherEmail: dto.orderForAnotherPerson
        ? dto.anotherEmail?.trim() || undefined
        : undefined,
      anotherPhoneNumber: dto.orderForAnotherPerson
        ? dto.anotherPhoneNumber?.trim() || undefined
        : undefined,

      // Доставка
      deliveryType: dto.deliveryType,
      deliveryCity: dto.deliveryCity,
      deliveryWarehouse: dto.deliveryWarehouse,

      // Додатково
      message: dto.message,
      dontCallMe: dto.dontCallMe,
      isAgree: dto.isAgree,
    });

    // Атомарно збільшуємо лічильник активацій промокоду.
    // Якщо хтось встиг вичерпати ліміт між validateForCart і create,
    // incrementUses поверне null — у цьому випадку "викочуємо" промокод
    // з замовлення, щоб не завищувати currentUses в базі.
    if (promoCodeDoc) {
      const updated = await this.promoCodeService.incrementUses(
        promoCodeDoc._id.toString(),
      );
      if (!updated) {
        this.logger.warn(
          `Promo code ${promoCodeDoc.code} limit was exhausted between validation and order creation for order ${order.orderNumber}. Skipping counter increment.`,
        );
      }
    }

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

    // ─── Онлайн-оплата: повертаємо LiqPay-параметри для редіректа ──────────
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (dto.paymentMethod === PaymentMethod.ONLINE) {
      const liqpay = this.liqpayService.buildCheckoutParams(order);
      return {
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        total: order.total,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        status: order.status,
        promoCode: order.promoCode,
        promoCodeDiscountAmount: order.promoCodeDiscountAmount,
        liqpay,
      };
    }

    return {
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      total: order.total,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      status: order.status,
      promoCode: order.promoCode,
      promoCodeDiscountAmount: order.promoCodeDiscountAmount,
      liqpay: null,
    };
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

    /* 📅 DATE RANGE — фільтр за датою створення (createdAt) */
    const dateFilter = this.buildDateFilter(query.dateFrom, query.dateTo);
    if (dateFilter) {
      filter.createdAt = dateFilter;
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

  /**
   * Будує Mongo-фільтр { $gte, $lte } для діапазону дат.
   * dateFrom — початок дня, dateTo — кінець дня (інклюзивно).
   * Повертає undefined якщо обидві дати не задані.
   */
  private buildDateFilter(
    dateFrom?: string,
    dateTo?: string,
  ): { $gte?: Date; $lte?: Date } | undefined {
    const range: { $gte?: Date; $lte?: Date } = {};

    if (dateFrom) {
      const from = new Date(dateFrom);
      if (!isNaN(from.getTime())) {
        from.setHours(0, 0, 0, 0);
        range.$gte = from;
      }
    }
    if (dateTo) {
      const to = new Date(dateTo);
      if (!isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999);
        range.$lte = to;
      }
    }

    return Object.keys(range).length ? range : undefined;
  }

  async findOrderById(orderId: string) {
    const order = await this.orderModel.findById(orderId).lean();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ─── Статистика (admin) ─────────────────────────────────────────────────────

  /**
   * Загальна статистика замовлень за період:
   *  - загальна кількість замовлень
   *  - загальна виручка (по завершених/оплачених)
   *  - середній чек
   *  - кількість проданих одиниць
   *  - розбивка за статусом замовлення
   *  - розбивка за статусом оплати
   *  - співвідношення гість / зареєстрований
   */
  async getStatsSummary(dateFrom?: string, dateTo?: string) {
    const dateMatch = this.buildDateFilter(dateFrom, dateTo);
    const match: FilterQuery<OrderDocument> = dateMatch
      ? { createdAt: dateMatch }
      : {};

    const [
      totalsAgg,
      statusBreakdown,
      paymentBreakdown,
      guestVsRegistered,
      totalItemsAgg,
      paidRevenueAgg,
    ] = await Promise.all([
      this.orderModel.aggregate<{
        _id: null;
        totalOrders: number;
        totalRevenue: number;
        avgOrderValue: number;
      }>([
        { $match: match },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            avgOrderValue: { $avg: '$total' },
          },
        },
      ]),
      this.orderModel.aggregate<{ _id: string; count: number; revenue: number }>([
        { $match: match },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: '$total' },
          },
        },
      ]),
      this.orderModel.aggregate<{ _id: string; count: number; revenue: number }>([
        { $match: match },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
            revenue: { $sum: '$total' },
          },
        },
      ]),
      this.orderModel.aggregate<{ _id: 'guest' | 'registered'; count: number; revenue: number }>([
        { $match: match },
        {
          $group: {
            _id: {
              $cond: [{ $ifNull: ['$userId', false] }, 'registered', 'guest'],
            },
            count: { $sum: 1 },
            revenue: { $sum: '$total' },
          },
        },
      ]),
      this.orderModel.aggregate<{ _id: null; totalItems: number }>([
        { $match: match },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            totalItems: { $sum: '$items.quantity' },
          },
        },
      ]),
      // Виручка лише за оплаченими замовленнями
      this.orderModel.aggregate<{ _id: null; paidRevenue: number; paidOrders: number }>([
        { $match: { ...match, paymentStatus: PaymentStatus.PAID } },
        {
          $group: {
            _id: null,
            paidRevenue: { $sum: '$total' },
            paidOrders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totals = totalsAgg[0] ?? {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
    };
    const items = totalItemsAgg[0]?.totalItems ?? 0;
    const paid = paidRevenueAgg[0] ?? { paidRevenue: 0, paidOrders: 0 };

    return {
      dateFrom: dateFrom ?? null,
      dateTo: dateTo ?? null,
      totalOrders: totals.totalOrders,
      totalRevenue: Math.round(totals.totalRevenue * 100) / 100,
      paidRevenue: Math.round(paid.paidRevenue * 100) / 100,
      paidOrders: paid.paidOrders,
      avgOrderValue: Math.round((totals.avgOrderValue || 0) * 100) / 100,
      totalItems: items,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s._id,
        count: s.count,
        revenue: Math.round(s.revenue * 100) / 100,
      })),
      paymentBreakdown: paymentBreakdown.map((p) => ({
        paymentStatus: p._id,
        count: p.count,
        revenue: Math.round(p.revenue * 100) / 100,
      })),
      customerTypeBreakdown: guestVsRegistered.map((c) => ({
        type: c._id,
        count: c.count,
        revenue: Math.round(c.revenue * 100) / 100,
      })),
    };
  }

  /**
   * Топ-товарів за період — за виручкою (revenue) або кількістю (quantity).
   */
  async getTopProducts(
    dateFrom?: string,
    dateTo?: string,
    limit: number = 10,
    sortBy: 'revenue' | 'quantity' = 'revenue',
  ) {
    const dateMatch = this.buildDateFilter(dateFrom, dateTo);
    const match: FilterQuery<OrderDocument> = dateMatch
      ? { createdAt: dateMatch }
      : {};

    const sortField = sortBy === 'quantity' ? 'quantity' : 'revenue';

    const result = await this.orderModel.aggregate<{
      _id: string;
      name: string;
      quantity: number;
      revenue: number;
      ordersCount: number;
    }>([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          quantity: { $sum: '$items.quantity' },
          revenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
          ordersCount: { $addToSet: '$_id' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          quantity: 1,
          revenue: 1,
          ordersCount: { $size: '$ordersCount' },
        },
      },
      { $sort: { [sortField]: -1 } },
      { $limit: limit },
    ]);

    return result.map((r) => ({
      productId: r._id,
      name: r.name,
      quantity: r.quantity,
      revenue: Math.round(r.revenue * 100) / 100,
      ordersCount: r.ordersCount,
    }));
  }

  /**
   * Часовий ряд замовлень і виручки для побудови графіків.
   * Гранулярність: day (за замовч.) / week / month.
   */
  async getOrdersTimeline(
    dateFrom?: string,
    dateTo?: string,
    granularity: 'day' | 'week' | 'month' = 'day',
  ) {
    const dateMatch = this.buildDateFilter(dateFrom, dateTo);
    const match: FilterQuery<OrderDocument> = dateMatch
      ? { createdAt: dateMatch }
      : {};

    const dateFormat =
      granularity === 'month'
        ? '%Y-%m'
        : granularity === 'week'
          ? '%G-%V' // ISO week (year-week)
          : '%Y-%m-%d';

    const result = await this.orderModel.aggregate<{
      _id: string;
      orders: number;
      revenue: number;
      paidRevenue: number;
      items: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' },
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
          paidRevenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0],
            },
          },
          items: {
            $sum: {
              $reduce: {
                input: '$items',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.quantity'] },
              },
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map((r) => ({
      bucket: r._id,
      orders: r.orders,
      revenue: Math.round(r.revenue * 100) / 100,
      paidRevenue: Math.round(r.paidRevenue * 100) / 100,
      items: r.items,
    }));
  }

  // ─── Хелпери для admin users модуля ──────────────────────────────────────────

  /** Всі замовлення користувача (без пагінації), відсортовані від нових до старих. */
  async findAllByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) return [];
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  /** Короткий підсумок по замовленнях користувача: кількість, сума. */
  async getUserOrdersSummary(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return { totalOrders: 0, totalRevenue: 0, paidRevenue: 0 };
    }
    const [agg] = await this.orderModel.aggregate<{
      totalOrders: number;
      totalRevenue: number;
      paidRevenue: number;
    }>([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          paidRevenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0],
            },
          },
        },
      },
    ]);
    return {
      totalOrders: agg?.totalOrders ?? 0,
      totalRevenue: Math.round((agg?.totalRevenue ?? 0) * 100) / 100,
      paidRevenue: Math.round((agg?.paidRevenue ?? 0) * 100) / 100,
    };
  }

  // ─── Методи для залогіненого користувача ─────────────────────────────────

  async findMyOrders(userId: string, query: OrderQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<OrderDocument> = {
      userId: new Types.ObjectId(userId),
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.paymentStatus) {
      filter.paymentStatus = query.paymentStatus;
    }

    const dateFilter = this.buildDateFilter(query.dateFrom, query.dateTo);
    if (dateFilter) {
      filter.createdAt = dateFilter;
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
      page,
      limit,
    };
  }

  async findMyOrderById(userId: string, orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new NotFoundException('Order not found');
    }
    const order = await this.orderModel
      .findOne({
        _id: new Types.ObjectId(orderId),
        userId: new Types.ObjectId(userId),
      })
      .lean();
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
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

    // Залишки більше не декрементуються при створенні замовлення,
    // тому і повертати нічого не треба при скасуванні.

    // Якщо статус реально змінився — шлемо нотифікації
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
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
    );

    if (order.promoCode) {
      parts.push(
        `<b>🎟 Промокод:</b> ${esc(order.promoCode)} (−${order.promoCodeDiscountAmount}₴)`,
      );
    }

    parts.push(
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
