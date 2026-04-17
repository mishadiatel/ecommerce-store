'use client'
import { useTranslations } from 'next-intl';
import PagesList from '@/components/admin/pages/pagesList/PagesList';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function AdminPages() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('pages.pagesControl');
  const tCommon = useTranslations('common');

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>{tCommon('accessDenied')}</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <PagesList />
    </div>
  );
}
