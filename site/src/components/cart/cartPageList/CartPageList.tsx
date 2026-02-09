'use client';

import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cartStore';
import Loader from '@/components/ui/loader/Loader';
import FreeShippingLine from '@/components/cart/freeShippingLine/FreeShippingLine';
import { Link } from '@/i18n/navigation';
import CartPageItem from '@/components/cart/cartPageItem/CartPageItem';
import { useEffect, useRef, useState } from 'react';

export default function CartPageList() {
  const t = useTranslations();
  const freeShippingPrice = 2000;
  const cartTotalPrice = useCartStore(s => s.cart?.total) || 0;
  const cartItems = useCartStore(s => s.cart?.items);
  const isCartLoading = useCartStore(s => s.isLoading);
  const totalProducts = useCartStore(s =>
    s.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );
  const asideRef = useRef<HTMLDivElement | null>(null);
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleScroll = () => {
      if (!asideRef.current) return;
      const isMobile = window.innerWidth < 1024;
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
  }, []);

  return (
    <>
      <div className="cart-block my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
        <div className="container">
          {isCartLoading ? (
            <div className={'flex items-center justify-center'}>
              <Loader />
            </div>
          ) : (
            <>
              {cartItems && cartItems?.length > 0 ? (
                <div className="content-main flex flex-col lg:flex-row justify-between gap-10 sm:gap-8">
                  <div className="w-full flex-grow">
                    <div className="time countdown-cart pb-5 mb-5 sm:pb-6 sm:mb-6 border-b border-b-gray-20">
                      <FreeShippingLine />
                    </div>
                    <div className="list-product w-full sm:mt-7 mt-5">
                      <div className="w-full">
                        <div
                          className="w-full hidden lg:grid grid-cols-[1.5fr_1fr_1fr_1fr] mb-4 pb-4 border-b border-b-gray-20">
                          <div
                            className="text-center font-bold text-sm uppercase text-black">{t('Cart.listLabel.items')}</div>
                          <div
                            className="text-center font-bold text-sm uppercase text-black">{t('Cart.listLabel.price')}</div>
                          <div
                            className="text-center font-bold text-sm uppercase text-black">{t('Cart.listLabel.quantity')}</div>
                          <div
                            className="text-center font-bold text-sm uppercase text-black">{t('Cart.listLabel.total')}</div>
                        </div>

                        <div className="list-product-main1  w-full flex flex-col">
                          {cartItems.map((cartItem) => (
                            <CartPageItem key={`cart-page-item-${cartItem.product._id}`} item={cartItem} />
                          ))}

                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="w-full lg:flex-[0_0_405px] checkout-aside"
                    ref={asideRef}
                  >
                    <div className="checkout-block bg-extra-light-gray px-5 py-6 rounded-2xl lg:sticky lg:top-[90px]">
                      <div className="font-semibold sm:font-bold text-[22px] sm:text-[28px] lg:text-[32px] mb-6">
                        {t('Cart.asideTitle')}
                      </div>
                      <div
                        className="flex items-center justify-between pb-3 mb-3 sm:mb-4 sm:pb-4 border-b border-b-gray-20">
                        <span
                          className="heading-6 text-gray-90 js--checkout-total-items">{t('Product.productsCount', { count: totalProducts })}:</span>
                        <span
                          className="secondary-body text-gray-90 ">{cartTotalPrice} {t('Product.currencyUah')}</span>
                      </div>

                      <div
                        className="flex items-center gap-4 justify-between pb-3 mb-3 sm:mb-4 sm:pb-4 border-b border-b-gray-20">
                        <span className="heading-6 text-gray-90">{t('Cart.deliveryTitle')}</span>
                        <span className="secondary-body text-gray-90 text-right">
                          {(cartTotalPrice >= freeShippingPrice) ? t('Cart.freeDeliveryLabel') : t('Cart.paidDeliveryLabel')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 justify-between mb-6 js--checkout-bottom-element">
                        <span className="font-semibold text-black text-lg sm:text-xl">{t('Cart.totalLabelText')}</span>
                        <span
                          className="font-semibold text-black text-lg sm:text-xl">{cartTotalPrice} {t('Product.currencyUah')}</span>
                      </div>
                      <div className="block-button flex flex-col items-center gap-y-4 mt-5">
                        <Link href={'/checkout'}
                              className="checkout-btn button-main text-center !w-full">{t('Cart.checkoutButtonText')}</Link>
                        <Link className="text-sm font-bold uppercase text-primary-green"
                              href={'/products'}>{t('Cart.continueShoppingButtonText')}</Link>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`checkout-bottom ${showBottom ? 'active' : ''}`}
                  >
                    <div className="container">
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-semibold text-black text-lg sm:text-xl">{t('Cart.totalLabelText')}</span>
                        <span className="font-semibold text-black text-lg sm:text-xl js--cart-grand-total-cost">
                          {cartTotalPrice} {t('Product.currencyUah')}
                        </span>
                      </div>
                      <Link href={'/checkout'}
                            className="checkout-btn button-main text-center !w-full">
                        {t('Cart.checkoutButtonText')}</Link></div>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={'font-semibold lg:font-bold text-center text-xl sm:text-[22px] lg:text-[32px] mb-5 sm:mb-6 lg:mb-8'}>{t('Cart.emptyCartMessage')}</div>
                  <div className="flex flex-col items-center gap-8">
                    <Link className="button-main w-full sm:w-fit"
                          href={'/products'}>{t('Cart.catalogButtonText')}</Link>
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </>

  );
}