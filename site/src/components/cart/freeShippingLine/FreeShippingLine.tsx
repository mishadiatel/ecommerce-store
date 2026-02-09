'use client'

import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cartStore';

export default function FreeShippingLine() {

  const t = useTranslations();
  const freeShippingPrice = 2000;
  const cartTotalPrice = useCartStore(s => s.cart?.total) || 0;

  return (
    <>
      {(cartTotalPrice && (cartTotalPrice >= freeShippingPrice)) ? (
        <div className="flex items-start gap-2 p-3 sm:p-4 bg-green-50 rounded-lg">
          <i className="icon icon-confetti"></i>

          <div className="w-full">
            <div className="text-sm sm:text-base text-gray-90 mb-3">
              {t('Cart.successFreeShippingText')}
            </div>
            <div className="heading banner mb-1">
              <div className="tow-bar-block">
                <div className="progress-line max-w-full w-full"></div>
              </div>
            </div>
            <div className="flex w-full justify-between items-center">
              <span className="text-sm text-gray-90">{cartTotalPrice} {t('Product.currencyUah')}</span>
              <span className="text-sm text-gray-90">{freeShippingPrice} {t('Product.currencyUah')}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-3 sm:p-4 bg-green-50 rounded-lg">
          <i className="icon icon-gift"></i>

          <div className="w-full">
            <div className="text-sm sm:text-base text-gray-90 mb-3">
              {t.rich('Cart.freeShippingPriceText', {
                priceText: `${freeShippingPrice - cartTotalPrice} ${t('Product.currencyUah')}`,
                pricespan: (chunks) => (
                  <span className="text-base text-black font-bold">
                          {chunks}
                        </span>
                ),
              })}
            </div>
            <div className="heading banner mb-1">
              <div className="tow-bar-block">
                <div className="progress-line max-w-full" style={{width: `${(cartTotalPrice / freeShippingPrice) * 100}%`}}></div>
              </div>
            </div>
            <div className="flex w-full justify-between items-center">
              <span className="text-sm text-gray-90">{cartTotalPrice} {t('Product.currencyUah')}</span>
              <span className="text-sm text-gray-90">{freeShippingPrice} {t('Product.currencyUah')}</span>
            </div>
          </div>
        </div>
      )}
    </>

  )
}