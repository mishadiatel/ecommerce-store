'use client'
import PagesList from '@/components/admin/pages/pagesList/PagesList';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';

export default function AdminPages() {
  const { isAuthenticated } = useAuth();
  const router = useRouter()

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }
  return (
    <div>
      <div className={'flex flex-col gap-8'}>
        <div>Pages</div>
        <PagesList  />
      </div>
    </div>
  );
}