'use client'
import GeneralContent from '@/components/admin/general/generalContent';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function AdminDashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="General"
        subtitle="General store settings and global configuration."
      />
      <GeneralContent />
    </div>
  );
}
