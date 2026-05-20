'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { useRouter } from '@/i18n/navigation';

export default function ActivationToast() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    const activated = searchParams?.get('activated');
    if (activated === '1') {
      handledRef.current = true;
      toast.success(t('Account.activation.successMessage'));
      router.replace('/account/login');
    } else if (activated === '0') {
      handledRef.current = true;
      toast.error(t('Account.activation.errorMessage'));
      router.replace('/account/login');
    }
  }, [searchParams, router, t]);

  return null;
}
