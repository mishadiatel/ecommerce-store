import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PaymentMethod, PaymentStatus, OrderStatus } from '../enum/order.enums';
import { OrderItem } from './order-item.schema';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  guestId: string | null;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  discount: number;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true, default: false })
  hasFreeDelivery: boolean;

  @Prop({
    type: String,
    enum: [PaymentMethod.ONLINE, PaymentMethod.CASH_ON_DELIVERY],
    required: true,
  })
  paymentMethod: string;

  @Prop({
    type: String,
    enum: [PaymentStatus.PENDING, PaymentStatus.FAILED, PaymentStatus.PAID],
    default: PaymentStatus.PENDING,
  })
  paymentStatus: string;

  @Prop({
    type: String,
    enum: [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ],
    default: OrderStatus.PENDING,
  })
  status: string;

  // user data
  @Prop() email: string;
  @Prop() firstName: string;
  @Prop() lastName: string;
  @Prop() phoneNumber: string;

  @Prop({ default: false })
  orderForAnotherPerson: boolean;

  @Prop({ required: false }) anotherFirstName?: string;
  @Prop({ required: false }) anotherLastName?: string;
  @Prop({ required: false }) anotherEmail?: string;
  @Prop({ required: false }) anotherPhoneNumber?: string;

  // delivery
  @Prop() deliveryType: string;
  @Prop() deliveryCity: string;
  @Prop() deliveryWarehouse: string;

  @Prop() message: string;

  @Prop({ default: false })
  dontCallMe: boolean;

  @Prop({ default: false })
  isAgree: boolean;

  // LiqPay tracking
  @Prop({ default: null }) liqpayPaymentId?: string;
  @Prop({ default: null }) liqpayTransactionId?: string;
  @Prop({ default: null }) liqpayStatus?: string;
  @Prop({ default: false }) isSandboxPayment?: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// 🔥 індекс
OrderSchema.index({ orderNumber: 1 }, { unique: true });
