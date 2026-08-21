import { projectApi } from '@/lib/axios';
import { GetItemsResponse } from '@/types/getItemsResponse';
import { Subscriber } from '@/types/subscriber';

export const getSubscribers = async (
  params?: Record<string, string | number>,
): Promise<GetItemsResponse<Subscriber> | undefined> => {
  try {
    const { data } = await projectApi.get('/api/subscribers', { params });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteSubscriber = async (id: string): Promise<void> => {
  try {
    await projectApi.delete(`/api/subscribers/${id}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
