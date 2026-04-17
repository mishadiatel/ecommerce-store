'use client'
import { useTranslations } from 'next-intl';
import BlocksList from '@/components/admin/blocks/blocksList/BlocksList';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function AdminBlocks() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('pages.blocks');
  const tCommon = useTranslations('common');

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>{tCommon('accessDenied')}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <BlocksList />
    </div>
  );
}
