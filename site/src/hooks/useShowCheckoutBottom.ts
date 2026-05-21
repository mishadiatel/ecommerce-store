'use client';

import { RefObject, useEffect, useRef, useState } from 'react';

interface UseShowCheckoutBottomOptions {
  /**
   * Breakpoint у пікселях — ховаємо `checkout-bottom` коли ширина вікна >= цього значення.
   * За замовчуванням 1024 (lg breakpoint у Tailwind).
   */
  mobileBreakpoint?: number;
}

interface UseShowCheckoutBottomResult {
  asideRef: RefObject<HTMLDivElement | null>;
  showBottom: boolean;
}

/**
 * Хук для керування видимістю мобільного `checkout-bottom` на сторінках
 * корзини та оформлення замовлення.
 *
 * Показує блок коли:
 *  - ширина вікна менше за `mobileBreakpoint` (за замовчуванням 1024px);
 *  - aside-блок (sticky сайдбар з підсумком) ще нижче за viewport
 *    (тобто користувач його не доскролив).
 */
export function useShowCheckoutBottom(
  options: UseShowCheckoutBottomOptions = {},
): UseShowCheckoutBottomResult {
  const { mobileBreakpoint = 1024 } = options;
  const asideRef = useRef<HTMLDivElement | null>(null);
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      if (!asideRef.current) return;
      const isMobile = window.innerWidth < mobileBreakpoint;
      if (!isMobile) {
        setShowBottom(false);
        return;
      }
      const rect = asideRef.current.getBoundingClientRect();
      const isAboveAside = rect.top > window.innerHeight;
      setShowBottom(isAboveAside);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [mobileBreakpoint]);

  return { asideRef, showBottom };
}
