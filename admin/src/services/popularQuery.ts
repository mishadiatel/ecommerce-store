import { projectApi } from '@/lib/axios';
import { GetItemsResponse } from '@/types/getItemsResponse';
import { PopularQuery } from '@/types/popularQuery';

export const getPopularQueries = async (
  queryParams?: Record<string, string | number>,
): Promise<GetItemsResponse<PopularQuery> | undefined> => {
  try {
    const { data } = await projectApi.get('/api/popular-query', {
      params: queryParams,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createPopularQuery = async (
  payload: Partial<PopularQuery>,
): Promise<PopularQuery | undefined> => {
  try {
    const { data } = await projectApi.post('/api/popular-query', payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updatePopularQuery = async (
  id: string,
  payload: Partial<PopularQuery>,
): Promise<PopularQuery | undefined> => {
  try {
    const { data } = await projectApi.patch(
      `/api/popular-query/${id}`,
      payload,
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deletePopularQuery = async (
  id: string,
): Promise<null | undefined> => {
  try {
    const { data } = await projectApi.delete(`/api/popular-query/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
