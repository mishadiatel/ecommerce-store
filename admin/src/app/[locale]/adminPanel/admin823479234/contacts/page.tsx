'use client';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import PageHeader from '@/components/admin/ui/pageHeader';
import ContactsForm from '@/components/admin/contacts/ContactsForm';

export default function AdminContactsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('pages.contacts');
  const tCommon = useTranslations('common');

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>{tCommon('accessDenied')}</div>;
  }
  return (
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <ContactsForm />
    </div>
  );
}
