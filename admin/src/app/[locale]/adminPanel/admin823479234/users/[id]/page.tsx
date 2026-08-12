'use client';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import PageHeader from '@/components/admin/ui/pageHeader';
import UserDetails from '@/components/admin/users/UserDetails';

export default function AdminUserDetailsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('pages.userDetails');
  const tCommon = useTranslations('common');

  const id = String(params.id ?? '');

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>{tCommon('accessDenied')}</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <UserDetails userId={id} />
    </div>
  );
}
