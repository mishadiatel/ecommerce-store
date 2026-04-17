'use client'
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import MailTemplatesList from '@/components/admin/mailTemplates/mailTemplatesList/MailTemplatesList';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function AdminMailsTemplates() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('pages.mailTemplates');
  const tCommon = useTranslations('common');

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>{tCommon('accessDenied')}</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <MailTemplatesList />
    </div>
  );
}
