import { projectApi } from '@/lib/axios';
import { Block } from '@/types/blocks';
import { GetItemsResponse } from '@/types/getItemsResponse';

export const getPublicBlocks = async (slug: string, queryParams?: Record<string, string | number>): Promise<Block<object>[] | undefined> => {
  try {
    const { data } = await projectApi.get(`/api/block/public/${slug}`, { params: queryParams });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};