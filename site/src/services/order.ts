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
}

export interface PaymentStatusResponse {
  orderNumber: string;
  paymentMethod: 'online' | 'cash_on_delivery' | string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  liqpayStatus: string | null;
  isSandboxPayment: boolean;
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
