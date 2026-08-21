import { projectApi } from '@/lib/axios';
import { GetItemsResponse } from '@/types/getItemsResponse';
import { Review } from '@/types/review';

export const getReviews = async (
  params?: Record<string, string | number>,
): Promise<GetItemsResponse<Review> | undefined> => {
  try {
    const { data } = await projectApi.get('/api/reviews', { params });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createReview = async (
  payload: Partial<Review> & {
    productId: string;
    firstName: string;
    lastName: string;
    rating: number;
    comment: string;
  },
): Promise<Review | undefined> => {
  try {
    const { data } = await projectApi.post('/api/reviews', payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateReview = async (
  id: string,
  payload: Partial<Review>,
): Promise<Review | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/reviews/${id}`, payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteReview = async (id: string): Promise<void> => {
  try {
    await projectApi.delete(`/api/reviews/${id}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
