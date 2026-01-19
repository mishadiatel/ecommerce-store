import { projectApi } from '@/lib/axios';
import { Page } from '@/types/pages';

export const getPublicPage = async (slug: string): Promise<Page | undefined> => {
  try {
    const { data } = await projectApi.get(`/api/pages/getPublicPage/${slug}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

