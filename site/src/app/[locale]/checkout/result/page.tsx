'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  getPaymentStatus,
  initLiqPayCheckout,
  PaymentStatusResponse,
} from '@/services/order';
import { openLiqPayInNewWindow, redirectToLiqPay } from '@/lib/liqpayRedirect';
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
    // Полимо ~15 хв (450 × 2s) — покриває кейси коли користувач повільно
    // вводить дані картки / підтверджує 3DS / переключається на банківський
    // додаток. При досягненні ліміту залишаємось у pending-стані —
    // користувач може оновити сторінку або спробувати оплатити знову.
    const maxAttempts = 450;

    // Одразу показуємо "pending" (чекаємо на оплату) а не порожній loading,
    // щоб не було враження помилки на першу секунду.
    setStatus('pending');

    const tick = async () => {
      attempts++;
      try {
        const data = await getPaymentStatus(orderId);
        if (cancelled) return;

        setInfo(data);

        // Cash on delivery — нічого не поллимо, одразу дякую-сторінка.
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

        // Online + pending — продовжуємо полити.
        if (attempts < maxAttempts) {
          setTimeout(tick, 2000);
        }
      } catch (err) {
        console.error(err);
        // Мережеві помилки — не збиваємо стан на "error", просто ретраїмо.
        if (attempts < maxAttempts && !cancelled) {
          setTimeout(tick, 2000);
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
      // Відкриваємо у новому вікні, поточна вкладка продовжує полити статус
      const opened = openLiqPayInNewWindow(params);
      if (!opened) {
        redirectToLiqPay(params);
        return;
      }
      // Повертаємо статус на "pending" щоб UI знов почав опитування
      setStatus('pending');
      setRetrying(false);
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
            <p className="max-w-md">{t('processingPayment')}</p>
            {orderId && (
              <p className="text-sm text-gray-500">
                {t('orderNumberLabel')}: {orderId}
              </p>
            )}
            <p className="text-sm text-gray-500">{t('pendingHint')}</p>
            <button
              type="button"
              onClick={retryPayment}
              disabled={retrying}
              className="button-main-outline disabled:opacity-60"
            >
              {retrying ? t('redirectingToPayment') : t('retryPayment')}
            </button>
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
