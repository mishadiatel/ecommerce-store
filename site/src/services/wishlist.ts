import { projectApi } from '@/lib/axios';
import { Wishlist } from '@/types/wishlist';


export const getWishlist = async (): Promise<Wishlist> => {
  try {
    const { data } = await projectApi.get(`/wishlist`);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addToWishlist = async (productId: string): Promise<Wishlist> => {
  try {
    const { data } = await projectApi.post(`/wishlist/${productId}`);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const removeFromWishlist = async (productId: string): Promise<Wishlist> => {
  try {
    const { data } = await projectApi.delete(`/wishlist/${productId}`);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const mergeWishlist = async (productIds: string[]): Promise<Wishlist> => {
  try {
    const { data } = await projectApi.post(`/wishlist/merge`, { productIds });
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};