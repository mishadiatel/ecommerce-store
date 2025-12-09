import { projectApi } from '@/lib/axios';
import { Page } from '@/types/pages';

export const getPages = async (queryParams?: Record<string, string | number>): Promise<Page[] | undefined> => {
  try {
    const { data } = await projectApi.get('/pages', { params: queryParams });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createPage = async (pageData: Partial<Page>): Promise<Page | undefined> => {
  try {
    const { data } = await projectApi.post('/pages', pageData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;

  }
};

export const updatePage = async (id: string, pageData: Partial<Page>): Promise<Page | undefined> => {
  try {
    const { data } = await projectApi.patch(`/pages/${id}`, pageData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPublicPage = async (slug: string): Promise<Page | undefined> => {
  try {
    const { data } = await projectApi.get(`/pages/getPublicPage/${slug}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deletePage = async (id: string): Promise<null | undefined> => {
  try {
    const { data } = await projectApi.delete(`/pages/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};