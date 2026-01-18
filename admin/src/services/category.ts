import { GetItemsResponse } from '@/types/getItemsResponse';
import { projectApi } from '@/lib/axios';
import { Category, CategoryTranslation, FullCategoryWithTranslation } from '@/types/category';

export const getAdminCategories = async (queryParams?: Record<string, string | number>): Promise<GetItemsResponse<FullCategoryWithTranslation> | undefined> => {
  try {
    const { data } = await projectApi.get('/api/category', { params: queryParams });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createCategory = async (dto: Partial<Category>): Promise<Category | undefined> => {
  try {
    const { data } = await projectApi.post('/api/category', dto);
    return data;
  } catch (error) {
    console.error(error);
    throw error;

  }
};

export const createCategoryTranslation = async (dto: Partial<CategoryTranslation>): Promise<CategoryTranslation | undefined> => {
  try {
    const { data } = await projectApi.post('/api/category/translations', dto);
    return data;
  } catch (error) {
    console.error(error);
    throw error;

  }
};

export const updateCategory = async (id: string, dto: Partial<Category>): Promise<Category | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/category/${id}`, dto);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateCategoryTranslation = async (id: string, dto: Partial<CategoryTranslation>): Promise<CategoryTranslation | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/category/translations/${id}`, dto);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<null | undefined> => {
  try {
    const { data } = await projectApi.delete(`/api/category/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteCategoryTranslation = async (id: string): Promise<null | undefined> => {
  try {
    const { data } = await projectApi.delete(`/api/category/translations/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllAdminCategories = async (): Promise<FullCategoryWithTranslation[] | undefined> => {
  try {
    const { data } = await projectApi.get('/api/category/allAdmin');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};