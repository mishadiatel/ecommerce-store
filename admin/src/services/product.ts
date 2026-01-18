import { GetItemsResponse } from '@/types/getItemsResponse';
import { projectApi } from '@/lib/axios';
import { FullProductWithTranslations, Product, ProductTranslation } from '@/types/product';

export const getAdminProducts = async (queryParams?: Record<string, string | number>): Promise<GetItemsResponse<FullProductWithTranslations> | undefined> => {
  try {
    const { data } = await projectApi.get('/api/product', { params: queryParams });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createProduct = async (dto: Partial<Product>): Promise<Product | undefined> => {
  try {
    const { data } = await projectApi.post('/api/product', dto);
    return data;
  } catch (error) {
    console.error(error);
    throw error;

  }
};

export const createProductTranslation = async (dto: Partial<ProductTranslation>): Promise<ProductTranslation | undefined> => {
  try {
    const { data } = await projectApi.post('/api/product/translations', dto);
    return data;
  } catch (error) {
    console.error(error);
    throw error;

  }
};

export const updateProduct = async (id: string, dto: Partial<Product>): Promise<Product | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/product/${id}`, dto);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateProductTranslation = async (id: string, dto: Partial<ProductTranslation>): Promise<ProductTranslation | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/product/translations/${id}`, dto);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<null | undefined> => {
  try {
    const { data } = await projectApi.delete(`/api/product/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteProductTranslation = async (id: string): Promise<null | undefined> => {
  try {
    const { data } = await projectApi.delete(`/api/product/translations/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};