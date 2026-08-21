import { projectApi } from '@/lib/axios';
import { GetItemsResponse } from '@/types/getItemsResponse';
import { Feedback } from '@/types/feedback';

export const getFeedbacks = async (
  params?: Record<string, string | number>,
): Promise<GetItemsResponse<Feedback> | undefined> => {
  try {
    const { data } = await projectApi.get('/api/feedback', { params });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const markFeedbackRead = async (
  id: string,
  isRead: boolean,
): Promise<Feedback | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/feedback/${id}/read`, {
      isRead,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteFeedback = async (id: string): Promise<void> => {
  try {
    await projectApi.delete(`/api/feedback/${id}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
