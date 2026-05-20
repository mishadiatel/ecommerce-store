import { getGeneralSettings } from '@/services/generalSettings';
import { getTranslations } from 'next-intl/server';
import AccountLayout from '@/components/account/layout/AccountLayout';
import SmallBreadcrumbsBlock from '@/components/breadcrumbs/SmallBreadcrumbsBlock';
import ProtectedRoute from '@/components/account/protectedRoute/ProtectedRoute';
import OrdersList from '@/components/account/orders/OrdersList';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account' });
  return {
    title: t('orders.pageTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function AccountOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getGeneralSettings(locale);
  const t = await getTranslations({ locale, namespace: 'Account' });

  return (
    <>
      <ProtectedRoute>
        <SmallBreadcrumbsBlock
          items={[
            { href: '/', name: settings.companyName },
            { name: t('orders.pageTitle') },
          ]}
        />
        <AccountLayout>
          <div className="flex flex-col gap-6">
            <div className=" flex flex-col gap-2">
              <div className="heading2">{t('orders.pageTitle')}</div>
              <div className="text-sm text-gray-90">{t('orders.subtitle')}</div>
            </div>
            <OrdersList />
          </div>
        </AccountLayout>
      </ProtectedRoute>
    </>
  );
}
