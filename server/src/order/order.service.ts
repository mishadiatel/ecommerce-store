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
import { OrderStatus, PaymentMethod, PaymentStatus } from './enum/order.enums';
import { FullProductWithTranslations } from '../product/interface/product.interface';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private cartService: CartService,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date();

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    const random = Math.floor(100000 + Math.random() * 900000);

    return `ORD-${y}${m}${d}-${random}`;
  }

  private calculateTotals(
    items: Array<{ quantity: number; product: FullProductWithTranslations }>,
  ) {
    let subtotal = 0;
    let discount = 0;

    for (const i of items) {
      const price = i.product.newPrice;
      const old = i.product.oldPrice ?? price;

      subtotal += old * i.quantity;
      discount += (old - price) * i.quantity;
    }

    const total = subtotal - discount;

    return { subtotal, discount, total };
  }

  async createOrder(user: JwtUser | null, dto: CreateOrderDto) {
    const cart = await this.cartService.getCart(user, dto.guestId);

    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    const orderItems = cart.items.map((i) => ({
      productId: i.product._id.toString(),
      name: i.product.name,
      price: i.product.newPrice,
      oldPrice: i.product.oldPrice ?? i.product.newPrice,
      quantity: i.quantity,
    }));

    const totals = this.calculateTotals(orderItems);

    const isCOD = dto.paymentMethod === String(PaymentMethod.CASH_ON_DELIVERY);

    const order = await this.orderModel.create({
      orderNumber: this.generateOrderNumber(),

      userId: user ? new Types.ObjectId(user.sub) : null,
      guestId: user ? null : dto.guestId,

      items: orderItems,
      ...totals,

      paymentMethod: dto.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.PENDING,

      ...dto,
    });

    await this.clearCart(user, dto.guestId);

    return order;
  }

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

  private async clearCart(user: JwtUser | null, guestId?: string) {
    const cart = await this.cartService['findOrCreateCart'](user, guestId);
    cart.items = [];
    await cart.save();
  }
}
