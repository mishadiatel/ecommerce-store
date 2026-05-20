'use client'

import { useEffect } from 'react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useLocale } from 'use-intl';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { getMe } from '@/services/auth';

export default function Setup() {
  const locale = useLocale();

  const load = useWishlistStore(s => s.load);
  const setLocale = useWishlistStore((s) => s.setLocale);

  const loadCart = useCartStore(s => s.load);
  const setCartLocale = useCartStore(s => s.setLocale)

  const setAuth = useAuthStore(s => s.setAuth);
  const logoutAuth = useAuthStore(s => s.logout);
  const setLoading = useAuthStore(s => s.setLoading);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      document.body.classList.add('is-touch-device');
    }
  }, []);

  useEffect(() => {
    (async function(){
      try {
        setLoading(true);
        const user = await getMe();
        if (user) {
          setAuth(user);
        } else {
          logoutAuth();
        }
      } catch {
        logoutAuth();
      } finally {
        setLoading(false);
      }
      setLocale(locale);
      await load();
      setCartLocale(locale);
      await loadCart();
    })();

  }, [locale]);

  // useEffect(() => {
  //   (async function () {
  //     try {
  //       setLoading(true);
  //       const user = await getMe();
  //       if (user) {
  //         setAuth(user);
  //       } else {
  //         logoutAuth();
  //       }
  //     } catch {
  //       logoutAuth();
  //     } finally {
  //       setLoading(false);
  //     }
  //   })();
  // }, []);

  return null;
}
