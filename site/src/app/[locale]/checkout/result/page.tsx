'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  getPaymentStatus,
  initLiqPayCheckout,
  PaymentStatusResponse,
} from '@/services/order';
import { redirectToLiqPay } from '@/lib/liqpayRedirect';
import { Link, useRouter } from '@/i18n/navigation';
import Loader from '@/components/ui/loader/Loader';

type DisplayStatus = 'loading' | 'pending' | 'paid' | 'failed' | 'cod' | 'error';

export default function CheckoutResultPage() {
  const t = useTranslations('Checkout');
  const tCommon = useTranslations();
  const search = useSearchParams();
  const router = useRouter();
  const orderId = search.get('orderId');

  const [status, setStatus] = useState<DisplayStatus>('loading');
  const [info, setInfo] = useState<PaymentStatusResponse | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20; // ≈ 40s of polling

    const tick = async () => {
      attempts++;
      try {
        const data = await getPaymentStatus(orderId);
        if (cancelled) return;

        setInfo(data);

        // Cash on delivery — nothing to poll, show thank-you immediately.
        if (data.paymentMethod === 'cash_on_delivery') {
          setStatus('cod');
          return;
        }

        if (data.paymentStatus === 'paid') {
          setStatus('paid');
          return;
        }
        if (data.paymentStatus === 'failed') {
          setStatus('failed');
          return;
        }

        // Online + pending → keep polling
        setStatus('pending');
        if (attempts < maxAttempts) {
          setTimeout(tick, 2000);
        }
      } catch (err) {
        console.error(err);
        if (attempts < maxAttempts && !cancelled) {
          setTimeout(tick, 2000);
        } else if (!cancelled) {
          setStatus('error');
        }
      }
    };

    void tick();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const retryPayment = async () => {
    if (!orderId) return;
    setRetrying(true);
    try {
      const params = await initLiqPayCheckout(orderId);
      redirectToLiqPay(params);
    } catch (err) {
      console.error(err);
      setRetrying(false);
    }
  };

  const goHome = () => router.push('/');

  return (
    <div className="container py-[60px] sm:py-[100px] min-h-[60vh]">
      <div className="mx-auto max-w-xl text-center">
        {info?.isSandboxPayment && (
          <div className="mb-4 inline-block rounded bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
            {t('sandboxNotice')}
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader />
            <p>{t('checkingPayment')}</p>
          </div>
        )}

        {status === 'pending' && (
          <div className="flex flex-col items-center gap-4">
            <Loader />
            <p>{t('processingPayment')}</p>
            {orderId && (
              <p className="text-sm text-gray-500">
                {t('orderNumberLabel')}: {orderId}
              </p>
            )}
          </div>
        )}

        {status === 'paid' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-5xl">✅</div>
            <h1 className="heading2">{t('paymentSuccessTitle')}</h1>
            {orderId && (
              <p className="text-gray-600">
                {t('orderNumberLabel')}: <b>{orderId}</b>
              </p>
            )}
            <p className="text-gray-600">{t('paymentSuccessMessage')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/" className="button-main">
                {t('backToHome')}
              </Link>
              <Link href="/products" className="button-main-outline">
                {tCommon('Cart.catalogButtonText')}
              </Link>
            </div>
          </div>
        )}

        {status === 'cod' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-5xl">📦</div>
            <h1 className="heading2">{t('codSuccessTitle')}</h1>
            {orderId && (
              <p className="text-gray-600">
                {t('orderNumberLabel')}: <b>{orderId}</b>
              </p>
            )}
            <p className="text-gray-600">{t('codSuccessMessage')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/" className="button-main">
                {t('backToHome')}
              </Link>
              <Link href="/products" className="button-main-outline">
                {tCommon('Cart.catalogButtonText')}
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-5xl">❌</div>
            <h1 className="heading2">{t('paymentFailedTitle')}</h1>
            <p className="text-gray-600">{t('paymentFailedMessage')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={retryPayment}
                disabled={retrying}
                className="button-main disabled:opacity-60"
              >
                {retrying ? t('redirectingToPayment') : t('retryPayment')}
              </button>
              <button
                type="button"
                onClick={goHome}
                className="button-main-outline"
              >
                {t('backToHome')}
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-6">
            <h1 className="heading2">{t('paymentUnknownTitle')}</h1>
            <p className="text-gray-600">{t('paymentUnknownMessage')}</p>
            <Link href="/" className="button-main">
              {t('backToHome')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
