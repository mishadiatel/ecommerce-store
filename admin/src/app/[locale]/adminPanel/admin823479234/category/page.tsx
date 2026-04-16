'use client'
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import CategoriesList from '@/components/admin/category/categoriesList/CategoriesList';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function CategoriesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        subtitle="Organize your products into categories with translations."
      />
      <CategoriesList />
    </div>
  );
}
