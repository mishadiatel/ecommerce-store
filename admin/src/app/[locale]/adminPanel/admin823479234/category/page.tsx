'use client'
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import CategoriesList from '@/components/admin/category/categoriesList/CategoriesList';

export default function CategoriesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter()

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <div className={'flex flex-col gap-8'}>
        <div>Categories</div>
        <CategoriesList />
      </div>
    </div>
  )
}