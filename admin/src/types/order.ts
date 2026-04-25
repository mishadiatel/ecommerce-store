export enum PaymentMethod {
  ONLINE = 'online',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  oldPrice: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;

  userId: string | null;
  guestId: string | null;

  items: OrderItem[];

  subtotal: number;
  discount: number;
  total: number;
  hasFreeDelivery: boolean;

  paymentMethod: PaymentMethod | string;
  paymentStatus: PaymentStatus | string;
  status: OrderStatus | string;

  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;

  orderForAnotherPerson: boolean;
  anotherFirstName?: string;
  anotherLastName?: string;
  anotherEmail?: string;
  anotherPhoneNumber?: string;

  deliveryType: string;
  deliveryCity: string;
  deliveryWarehouse: string;

  message?: string;
  dontCallMe: boolean;
  isAgree: boolean;

  // LiqPay tracking
  liqpayPaymentId?: string | null;
  liqpayTransactionId?: string | null;
  liqpayStatus?: string | null;
  isSandboxPayment?: boolean;

  // Promo code (denormalized)
  promoCodeId?: string | null;
  promoCode?: string | null;
  promoCodeDiscountType?: 'percent' | 'fixed' | null;
  promoCodeDiscountValue?: number | null;
  promoCodeDiscountAmount?: number;

  createdAt: string;
  updatedAt: string;
  __v?: number;
}
