'use client'
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import ProductsList from '@/components/admin/products/productsList/ProductsList';

export default function AdminProducts() {
  const { isAuthenticated } = useAuth();
  const router = useRouter()

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }
  return (
    <div>
      <div className={'flex flex-col gap-8'}>
        <div>Products</div>
        <ProductsList />
      </div>
    </div>
  );
}