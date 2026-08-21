import { Cart } from '@/types/cart';
import { projectApi } from '@/lib/axios';

export const getCart = async (
  guestId?: string,
  lang?: string,
): Promise<Cart> => {
  try {
    const { data } = await projectApi.post(`/api/cart/get`, { guestId }, {params: {lang}});
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addToCart = async (
  payload: { productId: string; quantity: number; guestId?: string; variantSku?: string | null },
  lang: string
): Promise<Cart> => {
  try {
    const { data } = await projectApi.post(`/api/cart/add`, payload, {params: {lang}});
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updateCartQty = async (
  payload: { productId: string; quantity: number; guestId?: string; variantSku?: string | null },
  lang: string
): Promise<Cart> => {
  try {
    const { data } = await projectApi.patch(`/api/cart/qty`, payload, {params: {lang}});
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const removeFromCart = async (
  payload: { productId: string; guestId?: string; variantSku?: string | null },
  lang: string
): Promise<Cart> => {
  try {
    const { data } = await projectApi.delete(`/api/cart/remove`, {
      params: { lang: lang, ...payload  },
    });
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
