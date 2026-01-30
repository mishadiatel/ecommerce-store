import { create } from 'zustand';
import { guestWishlist } from '@/lib/guestWishlist';
import { devtools } from 'zustand/middleware';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  mergeWishlist,
} from '@/services/wishlist';
import { useAuthStore } from '@/stores/authStore';
import { FullProductWithTranslations } from '@/types/product';
import { getProductByIdsArray } from '@/services/product';

interface WishlistState {
  ids: string[];
  items: FullProductWithTranslations[]
  isLoading: boolean;
  isSyncing: boolean;
  locale: string;

  load: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  syncWithAuth: () => Promise<void>;
  clear: () => void;
  setLocale: (locale: string) => void;

  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  devtools(
    (set, get) => ({
      ids: [],
      items: [],
      isLoading: true,
      isSyncing: false,
      locale: 'ua',

      async load() {
        set({ isLoading: true });
        const { isAuth } = useAuthStore.getState();
        const { locale } = get();

        try {
          let ids: string[] = []
          if (isAuth) {
            const data = await getWishlist();
             ids = data.productIds
          } else {
             ids = guestWishlist.get()
          }
          const items = await getProductByIdsArray(ids, locale)
          set({ ids: ids, items });
        } finally {
          set({ isLoading: false });
        }
      },

      async toggle(productId) {
        const { isAuth } = useAuthStore.getState();
        const prevIds = get().ids;
        const exists = prevIds.includes(productId);

        set({
          ids: exists
            ? prevIds.filter(id => id !== productId)
            : [...prevIds, productId],
        });

        try {
          if (isAuth) {
            exists
              ? await removeFromWishlist(productId)
              : await addToWishlist(productId);
          } else {
            exists
              ? guestWishlist.remove(productId)
              : guestWishlist.add(productId);
          }
          const items = await getProductByIdsArray(get().ids, get().locale)
          set({ items });
        } catch {
          set({ ids: prevIds });
        }


      },

      async syncWithAuth() {
        const guestIds = guestWishlist.get();
        if (!guestIds.length) return;

        set({ isSyncing: true });

        try {
          const data = await mergeWishlist(guestIds);
          set({ ids: data.productIds });
          const items = await getProductByIdsArray(get().ids, get().locale)
          set({ items });
          guestWishlist.clear();
        } finally {
          set({ isSyncing: false });
        }
      },

      clear() {
        set({
          ids: [],
          items: [],
          isLoading: false,
          isSyncing: false,
        });
      },

      has(productId) {
        return get().ids.includes(productId);
      },
      setLocale(locale) {
        set({ locale });
      },
    }),
    {
      name: 'wishlist-store',
    }
  )
);