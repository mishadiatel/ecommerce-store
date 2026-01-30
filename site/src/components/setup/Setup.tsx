'use client'

import { useEffect } from 'react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useLocale } from 'use-intl';

export default function Setup() {
  const load = useWishlistStore(s => s.load);
  const locale = useLocale();
  const setLocale = useWishlistStore((s) => s.setLocale);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      document.body.classList.add('is-touch-device');
    }
  }, []);

  useEffect(() => {
    load();
  }, [locale]);

  useEffect(() => {
    setLocale(locale);
  }, [locale, setLocale]);

  return null;
}
