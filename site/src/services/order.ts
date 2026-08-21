import { projectApi } from '@/lib/axios';

export interface CreateOrderPayload {
  guestId?: string;
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
  paymentMethod: string;
  message?: string;
  dontCallMe: boolean;
  isAgree: boolean;
  promoCode?: string;
}

export interface LiqPayCheckoutParams {
  data: string;
  signature: string;
  checkoutUrl: string;
}

export interface CreatedOrder {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  liqpay: LiqPayCheckoutParams | null;
  promoCode?: string | null;
  promoCodeDiscountAmount?: number;
}

export interface PaymentStatusResponse {
  orderNumber: string;
  paymentMethod: 'online' | 'cash_on_delivery' | string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  liqpayStatus: string | null;
  isSandboxPayment: boolean;
}

export type PromoDiscountType = 'percent' | 'fixed';

export interface ValidatePromoCodePayload {
  code: string;
  guestId?: string;
}

export interface ValidatePromoCodeResponse {
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  discountAmount: number;
}

export interface MyOrderItem {
  productId: string;
  name: string;
  price: number;
  oldPrice: number;
  quantity: number;
  variantSku?: string | null;
  variantName?: string;
}

export interface MyOrder {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  discount: number;
  hasFreeDelivery: boolean;
  promoCode?: string | null;
  promoCodeDiscountAmount?: number;
  items: MyOrderItem[];
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  orderForAnotherPerson?: boolean;
  anotherFirstName?: string;
  anotherLastName?: string;
  anotherEmail?: string;
  anotherPhoneNumber?: string;
  deliveryType?: string;
  deliveryCity?: string;
  deliveryWarehouse?: string;
  message?: string;
  dontCallMe?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MyOrdersPage {
  data: MyOrder[];
  totalDocuments: number;
  totalPages: number;
  page: number;
  limit: number;
}

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<CreatedOrder> => {
  const { data } = await projectApi.post<CreatedOrder>('/api/order', payload);
  return data;
};

export const getPaymentStatus = async (
  orderNumber: string,
): Promise<PaymentStatusResponse> => {
  const { data } = await projectApi.get<PaymentStatusResponse>(
    `/api/payments/liqpay/status/${orderNumber}`,
  );
  return data;
};

export const initLiqPayCheckout = async (
  orderNumber: string,
): Promise<LiqPayCheckoutParams> => {
  const { data } = await projectApi.post<LiqPayCheckoutParams>(
    '/api/payments/liqpay/init',
    { orderNumber },
  );
  return data;
};

export const validatePromoCode = async (
  payload: ValidatePromoCodePayload,
): Promise<ValidatePromoCodeResponse> => {
  const { data } = await projectApi.post<ValidatePromoCodeResponse>(
    '/api/promo-code/validate',
    payload,
  );
  return data;
};

export const getMyOrders = async (
  page: number,
  limit: number,
): Promise<MyOrdersPage> => {
  const { data } = await projectApi.get<MyOrdersPage>('/api/order/my', {
    params: { page, limit },
  });
  return data;
};

export const getMyOrder = async (id: string): Promise<MyOrder> => {
  const { data } = await projectApi.get<MyOrder>(`/api/order/my/${id}`);
  return data;
};
