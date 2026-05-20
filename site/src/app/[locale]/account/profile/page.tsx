import { getGeneralSettings } from '@/services/generalSettings';
import { getTranslations } from 'next-intl/server';
import AccountLayout from '@/components/account/layout/AccountLayout';
import ProfileForm from '@/components/account/profile/ProfileForm';
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
    title: t('myDataPageTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function AccountProfilePage({
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
                    { name: t('personalAccountTitle') },
                ]}
            />
            <AccountLayout>

                <div className="flex flex-col gap-6">
                    <div>
                        <div className="heading2 mb-2">{t('myDataPageTitle')}</div>
                        <div className="text-sm text-gray-90">{t('myDataSubtitle')}</div>
                    </div>
                    <ProfileForm />
                </div>
            </AccountLayout>
        </ProtectedRoute>
    </>
  );
}
