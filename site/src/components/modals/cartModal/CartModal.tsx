'use client';

import { useModalStore } from '@/stores/useModalStore';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cartStore';
import { Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import Loader from '@/components/ui/loader/Loader';
import CartPopupItem from '@/components/cart/cartPopupItem/CartPopupItem';
import FreeShippingLine from '@/components/cart/freeShippingLine/FreeShippingLine';

const ScrollSlider = dynamic(
  () => import('@/components/ui/scrollSlider/ScrollSlider')
);

export default function CartModal({open}: {open: boolean}) {
  const t = useTranslations();
  const freeShippingPrice = 2000;
  const cartTotalPrice = useCartStore(s => s.cart?.total) || 0;
  const cartItems = useCartStore(s => s.cart?.items);
  const isCartLoading = useCartStore(s => s.isLoading);
  const closeModal = useModalStore(s => s.closeModal);

  return (
    <div className="modal-cart-block ">
      <div className="modal-cart-overlay" onClick={closeModal}></div>
      <div className={`modal-cart-main flex ${open ? 'open' : ''}`}>
        <div className="cart-block flex flex-col w-full p-5 sm:p-8 relative overflow-hidden">
          <div className="heading mb-6 flex items-center justify-between relative">
            <div className="font-semibold sm:font-bold text-black text-[22px] sm:text-[28px] lg:text-[32px]">
              {t('Cart.modalTitle')}
            </div>
            <button
              className="close-btn button-main icon-button middle bg-gray absolute top-0 right-0 js--cart-close-btn"
              onClick={closeModal}
            >
              <i className="icon icon-x"></i>
            </button>
          </div>

          <div className="time countdown-cart pb-5 mb-5 sm:pb-6 sm:mb-6 border-b border-b-gray-20">
            <FreeShippingLine />
          </div>
          {isCartLoading ? (
            <div className={'flex items-center justify-center'}>
              <Loader />
            </div>
          ) : (
            <>
              {cartItems && cartItems?.length > 0 ? (
              <ScrollSlider
                sliderId={'cart-popup-slider'}
                className={'horizontal-scroll-slider w-full list-product1 product-list'}
              >
                <div className="swiper-wrapper">
                  <div className="swiper-slide pb-4">
                    <div className="flex flex-col gap-3 sm:gap-5 pr-3">
                      {cartItems.map((cartItem) => (
                        <CartPopupItem item={cartItem} key={`cart-popup-${cartItem.product._id}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="cart-popup-slider-scrollbar swiper-scrollbar">
                </div>
              </ScrollSlider>
            ) : (
              <div>{t('Cart.emptyCartMessage')}</div>
            )}
            </>
          )}


          <div className="footer-modal bg-white w-full mt-auto">
            <div className="flex items-center justify-between mb-6 pt-3 mt-3 sm:mb-8 border-t border-t-gray-20">
              <div className="text-xl font-semibold text-black">{t('Cart.totalLabelText')}</div>
              <div className="text-xl font-semibold text-black">
                {cartTotalPrice} {t('Product.currencyUah')}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <Link href={'/cart'}
                   className="button-main sm:basis-1/2 w-full uppercase mx-auto"
                      onClick={closeModal}
                >
                  {t('Cart.cartPageLinkText')} </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}