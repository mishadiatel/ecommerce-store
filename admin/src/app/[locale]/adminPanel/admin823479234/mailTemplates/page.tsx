'use client'
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import MailTemplatesList from '@/components/admin/mailTemplates/mailTemplatesList/MailTemplatesList';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function AdminMailsTemplates() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mail templates"
        subtitle="Edit transactional email templates sent to customers."
      />
      <MailTemplatesList />
    </div>
  );
}
