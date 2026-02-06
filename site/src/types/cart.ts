import { FullProductWithTranslations } from '@/types/product';

export interface CartItem {
  product: FullProductWithTranslations;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}