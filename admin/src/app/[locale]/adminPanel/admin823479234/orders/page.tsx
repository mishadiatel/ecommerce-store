'use client'
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import OrdersList from '@/components/admin/orders/ordersList/OrdersList';

export default function AdminOrders() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }
  return (
    <div>
      <div className={'flex flex-col gap-8'}>
        <div>Orders</div>
        <OrdersList />
      </div>
    </div>
  );
}
