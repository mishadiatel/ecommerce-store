import { GetItemsResponse } from '@/types/getItemsResponse';
import { projectApi } from '@/lib/axios';
import { Order, OrderStatus } from '@/types/order';

export const getAdminOrders = async (
  queryParams?: Record<string, string | number>,
): Promise<GetItemsResponse<Order> | undefined> => {
  try {
    const { data } = await projectApi.get('/api/order', { params: queryParams });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAdminOrderById = async (id: string): Promise<Order | undefined> => {
  try {
    const { data } = await projectApi.get(`/api/order/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateAdminOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<Order | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/order/${id}/status`, { status });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const markAdminOrderAsPaid = async (id: string): Promise<Order | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/order/${id}/mark-paid`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
