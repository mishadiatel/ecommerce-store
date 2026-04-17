'use client'
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/admin/authProvider/AdminAuthProvider';
import { useRouter } from '@/i18n/navigation';
import OrdersList from '@/components/admin/orders/ordersList/OrdersList';
import PageHeader from '@/components/admin/ui/pageHeader';

export default function AdminOrders() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('pages.orders');
  const tCommon = useTranslations('common');

  if (!isAuthenticated) {
    router.replace('/adminPanel/login');
    return <div>{tCommon('accessDenied')}</div>;
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <OrdersList />
    </div>
  );
}
