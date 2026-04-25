'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import PromoCodesList from '@/components/admin/promoCodes/promoCodesList/PromoCodesList';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function AdminPromoCodes() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('pages.promoCodes');
  const tCommon = useTranslations('common');

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>{tCommon('accessDenied')}</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <PromoCodesList />
    </div>
  );
}
