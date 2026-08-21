import { FullProductWithTranslations } from '@/types/product';

export interface CartItem {
  product: FullProductWithTranslations;
  quantity: number;
  variantSku?: string | null;
  variantName?: string;
  effectivePrice?: number;
  effectiveOldPrice?: number;
  availableStock?: number;
  outOfStock?: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}
