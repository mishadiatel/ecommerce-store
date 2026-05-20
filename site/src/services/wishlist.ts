import { projectApi } from '@/lib/axios';
import { Wishlist } from '@/types/wishlist';


export const getWishlist = async (): Promise<Wishlist> => {
  try {
    const { data } = await projectApi.get(`/api/wishlist`);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addToWishlist = async (productId: string): Promise<Wishlist> => {
  try {
    const { data } = await projectApi.post(`/api/wishlist/${productId}`);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const removeFromWishlist = async (productId: string): Promise<Wishlist> => {
  try {
    const { data } = await projectApi.delete(`/api/wishlist/${productId}`);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const mergeWishlist = async (productIds: string[]): Promise<Wishlist> => {
  try {
    const { data } = await projectApi.post(`/api/wishlist/merge`, { productIds });
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};