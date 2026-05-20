import { getGeneralSettings } from '@/services/generalSettings';
import { getTranslations } from 'next-intl/server';
import ForgotPasswordForm from '@/components/account/forgotPassword/ForgotPasswordForm';
import type { Metadata } from 'next';
import SmallBreadcrumbsBlock from "@/components/breadcrumbs/SmallBreadcrumbsBlock";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account' });
  return {
    title: t('forgotPassword.pageTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function AccountForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getGeneralSettings(locale);
  const t = await getTranslations({ locale, namespace: 'Account' });

  return (
    <>
      <SmallBreadcrumbsBlock
        items={[
          { href: '/', name: settings.companyName },
          { href: '/account/login', name: t('loginPageTitle') },
          { name: t('forgotPassword.pageTitle') },
        ]}
      />
      <div className="my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
        <div className="container">
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-20 p-5 sm:p-8 flex flex-col gap-6">
            <div className="text-center">
              <div className="heading2 mb-2">
                {t('forgotPassword.pageTitle')}
              </div>
              <div className="text-sm text-gray-90">
                {t('forgotPassword.subtitle')}
              </div>
            </div>
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </>
  );
}
