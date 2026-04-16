'use client'
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import ProductsList from '@/components/admin/products/productsList/ProductsList';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function AdminProducts() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        subtitle="Manage your store catalog, stock and product translations."
      />
      <ProductsList />
    </div>
  );
}
