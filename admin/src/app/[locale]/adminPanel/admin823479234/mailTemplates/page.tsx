'use client'
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import MailTemplatesList from '@/components/admin/mailTemplates/mailTemplatesList/MailTemplatesList';

export default function AdminMailsTemplates() {
  const { isAuthenticated } = useAuth();
  const router = useRouter()

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }
  return (
    <div>
      <div className={'flex flex-col gap-8'}>
        <div>Mail templates</div>
        <MailTemplatesList />
      </div>
    </div>
  );
}