'use client';

import { useModalStore, PromoCodeResultPayload } from '@/stores/useModalStore';
import { useTranslations } from 'next-intl';

export default function PromoCodeModal({ open }: { open: boolean }) {
  const t = useTranslations('Checkout');
  const tProduct = useTranslations('Product');
  const closeModal = useModalStore((s) => s.closeModal);
  const payload = useModalStore((s) => s.modal?.payload) as
    | PromoCodeResultPayload
    | undefined;

  if (!open || !payload) return null;

  const isSuccess = payload.success;

  return (
    <div className="modal-cart-block">
      <div className="modal-cart-overlay" onClick={closeModal}></div>
      <div className={`modal-cart-main flex ${open ? 'open' : ''}`}>
        <div className="cart-block flex flex-col w-full p-5 sm:p-8 relative">
          <div className="heading mb-6 flex items-center justify-between relative">
            <div className="font-semibold sm:font-bold text-black text-[22px] sm:text-[28px] lg:text-[32px]">
              {isSuccess
                ? t('promoCodeSuccessTitle')
                : t('promoCodeErrorTitle')}
            </div>
            <button
              className="close-btn button-main icon-button middle bg-gray absolute top-0 right-0"
              onClick={closeModal}
              aria-label="close"
            >
              <i className="icon icon-x"></i>
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 text-center my-6">
            <div className="text-5xl">{isSuccess ? '✅' : '❌'}</div>
            <div
              className={`text-base sm:text-lg ${
                isSuccess ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {payload.message}
            </div>

            {isSuccess && payload.code && (
              <div className="bg-green-50 rounded-lg px-4 py-3 w-full">
                <div className="text-sm text-gray-90 mb-1">
                  {t('promoCodeAppliedLabel')}
                </div>
                <div className="font-mono font-bold text-lg uppercase">
                  {payload.code}
                </div>
                {typeof payload.discountAmount === 'number' &&
                  payload.discountAmount > 0 && (
                    <div className="text-sm text-gray-90 mt-1">
                      {t('promoCodeDiscountAmountLabel')}: -
                      {payload.discountAmount} {tProduct('currencyUah')}
                    </div>
                  )}
              </div>
            )}
          </div>

          <div className="footer-modal bg-white w-full mt-auto">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={closeModal}
                className="button-main w-full uppercase mx-auto"
              >
                {t('promoCodeModalClose')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
