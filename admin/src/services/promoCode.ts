import { projectApi } from '@/lib/axios';
import { GetItemsResponse } from '@/types/getItemsResponse';
import {
  CreatePromoCodePayload,
  PromoCode,
  UpdatePromoCodePayload,
} from '@/types/promoCode';

export const getAdminPromoCodes = async (
  queryParams?: Record<string, string | number>,
): Promise<GetItemsResponse<PromoCode> | undefined> => {
  try {
    const { data } = await projectApi.get('/api/promo-code', {
      params: queryParams,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAdminPromoCodeById = async (
  id: string,
): Promise<PromoCode | undefined> => {
  try {
    const { data } = await projectApi.get(`/api/promo-code/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createAdminPromoCode = async (
  payload: CreatePromoCodePayload,
): Promise<PromoCode | undefined> => {
  try {
    const { data } = await projectApi.post('/api/promo-code', payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateAdminPromoCode = async (
  id: string,
  payload: UpdatePromoCodePayload,
): Promise<PromoCode | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/promo-code/${id}`, payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteAdminPromoCode = async (
  id: string,
): Promise<{ _id: string } | undefined> => {
  try {
    const { data } = await projectApi.delete(`/api/promo-code/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
