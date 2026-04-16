'use client'
import PagesList from '@/components/admin/pages/pagesList/PagesList';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function AdminPages() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pages"
        subtitle="Manage your site pages, SEO metadata and content."
      />
      <PagesList />
    </div>
  );
}
