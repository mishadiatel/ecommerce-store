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

export interface CreatedOrder {
  _id: string;
  orderNumber: string;
  total: number;
  deliveryCost: number;
  isFreeShipping: boolean;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
}

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<CreatedOrder> => {
  const { data } = await projectApi.post<CreatedOrder>('/api/order', payload);
  return data;
};
