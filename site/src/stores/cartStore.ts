import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { Cart } from '@/types/cart';
import { useAuthStore } from '@/stores/authStore';
import { addToCart, getCart, removeFromCart, updateCartQty } from '@/services/cart';
import { guestCart } from '@/stores/guestCart';
import { useModalStore } from '@/stores/useModalStore';

interface CartState {
  cart: Cart | null;
  locale: string;
  isLoading: boolean;
  setLocale: (locale: string) => void;
  load: () => Promise<void>;
  add: (
    productId: string,
    quantity: number,
    variantSku?: string | null,
  ) => Promise<void>;
  update: (
    productId: string,
    quantity: number,
    variantSku?: string | null,
  ) => Promise<void>;
  remove: (productId: string, variantSku?: string | null) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  devtools((set, get) => ({
    cart: null,
    locale: 'ua',
    isLoading: true,

    setLocale(locale: string) {
      set({ locale });
    },

    async load() {
      const { isAuth } = useAuthStore.getState();
      const guestId = !isAuth ? guestCart.get() : undefined;

      set({ isLoading: true });

      const data = await getCart(guestId, get().locale);

      set({ cart: data, isLoading: false });
    },

    async add(productId, quantity, variantSku = null) {
      const { isAuth } = useAuthStore.getState();
      const guestId = !isAuth ? guestCart.get() : undefined;

      const data = await addToCart({
        productId,
        quantity,
        guestId,
        variantSku,
      }, get().locale);

      set({ cart: data });
      useModalStore.getState().openModal('cart')
    },

    async update(productId, quantity, variantSku = null) {
      const { isAuth } = useAuthStore.getState();
      const guestId = !isAuth ? guestCart.get() : undefined;

      const data = await updateCartQty({
        productId,
        quantity,
        guestId,
        variantSku,
      }, get().locale);

      set({ cart: data });
    },

    async remove(productId, variantSku = null) {
      const { isAuth } = useAuthStore.getState();
      const guestId = !isAuth ? guestCart.get() : undefined;

      const data = await removeFromCart({
        productId,
        guestId,
        variantSku,
      }, get().locale);

      set({ cart: data });
    },
  }))
);