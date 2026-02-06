'use client'

import { useEffect } from 'react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useLocale } from 'use-intl';
import { useCartStore } from '@/stores/cartStore';

export default function Setup() {
  const locale = useLocale();

  const load = useWishlistStore(s => s.load);
  const setLocale = useWishlistStore((s) => s.setLocale);

  const loadCart = useCartStore(s => s.load);
  const setCartLocale = useCartStore(s => s.setLocale)

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      document.body.classList.add('is-touch-device');
    }
  }, []);

  useEffect(() => {
    (async function(){
      setLocale(locale);
      await load();
      setCartLocale(locale);
      await loadCart();
    })();

  }, [locale]);

  return null;
}
