'use client'
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import OrdersList from '@/components/admin/orders/ordersList/OrdersList';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function AdminOrders() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>Access Denied</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        subtitle="Track customer orders, update statuses and manage payments."
      />
      <OrdersList />
    </div>
  );
}
