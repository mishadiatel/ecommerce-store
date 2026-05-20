import { getGeneralSettings } from '@/services/generalSettings';
import { getTranslations } from 'next-intl/server';
import ResetPasswordForm from '@/components/account/resetPassword/ResetPasswordForm';
import type { Metadata } from 'next';
import SmallBreadcrumbsBlock from "@/components/breadcrumbs/SmallBreadcrumbsBlock";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account' });
  return {
    title: t('resetPassword.pageTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function AccountResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const settings = await getGeneralSettings(locale);
  const t = await getTranslations({ locale, namespace: 'Account' });

  return (
    <>
      <SmallBreadcrumbsBlock
        items={[
          { href: '/', name: settings.companyName },
          { href: '/account/login', name: t('loginPageTitle') },
          { name: t('resetPassword.pageTitle') },
        ]}
      />
      <div className="my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
        <div className="container">
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-20 p-5 sm:p-8 flex flex-col gap-6">
            <div className="text-center">
              <div className="heading2 mb-2">
                {t('resetPassword.pageTitle')}
              </div>
              <div className="text-sm text-gray-90">
                {t('resetPassword.subtitle')}
              </div>
            </div>
            <ResetPasswordForm token={token} />
          </div>
        </div>
      </div>
    </>
  );
}
