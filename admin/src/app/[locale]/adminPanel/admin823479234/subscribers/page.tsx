'use client';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import PageHeader from '@/components/admin/ui/pageHeader';
import SubscribersList from '@/components/admin/subscribers/SubscribersList';

export default function AdminSubscribersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('pages.subscribers');
  const tCommon = useTranslations('common');

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>{tCommon('accessDenied')}</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <SubscribersList />
    </div>
  );
}
