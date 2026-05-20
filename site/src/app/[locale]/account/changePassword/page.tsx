import { getGeneralSettings } from '@/services/generalSettings';
import { getTranslations } from 'next-intl/server';
import AccountLayout from '@/components/account/layout/AccountLayout';
import ChangePasswordForm from '@/components/account/changePassword/ChangePasswordForm';
import type { Metadata } from 'next';
import SmallBreadcrumbsBlock from "@/components/breadcrumbs/SmallBreadcrumbsBlock";
import ProtectedRoute from "@/components/account/protectedRoute/ProtectedRoute";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account' });
  return {
    title: t('changePasswordPageTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function AccountChangePasswordPage({
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
                    { name: t('changePasswordPageTitle') },
                ]}
            />
            <AccountLayout>

                <div className="flex flex-col gap-6">
                    <div>
                        <div className="heading2 mb-2">{t('changePasswordPageTitle')}</div>
                        <div className="text-sm text-gray-90">{t('changePasswordSubtitle')}</div>
                    </div>
                    <ChangePasswordForm />
                </div>
            </AccountLayout>
        </ProtectedRoute>

    </>
  );
}
