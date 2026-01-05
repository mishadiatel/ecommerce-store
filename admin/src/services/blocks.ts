import { projectApi } from '@/lib/axios';
import { Block } from '@/types/blocks';
import { GetItemsResponse } from '@/types/getItemsResponse';

export const getBlocks = async (queryParams?: Record<string, string | number>): Promise<GetItemsResponse<Block<object>> | undefined> => {
  try {
    const { data } = await projectApi.get('/api/block', { params: queryParams });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createBlock = async (pageData: Partial<Block<object>>): Promise<Block<object> | undefined> => {
  try {
    const { data } = await projectApi.post('/api/block', pageData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;

  }
};

export const updateBlock = async (id: string, pageData: Partial<Block<object>>): Promise<Block<object> | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/block/${id}`, pageData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPublicBlocks = async (slug: string, queryParams?: Record<string, string | number>): Promise<Block<object>[] | undefined> => {
  try {
    const { data } = await projectApi.get(`/api/block/public/${slug}`, { params: queryParams });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteBlock = async (id: string): Promise<null | undefined> => {
  try {
    const { data } = await projectApi.delete(`/api/block/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};