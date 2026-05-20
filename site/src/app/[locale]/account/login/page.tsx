import { Suspense } from 'react';
import { getPublicPageInfo } from '@/services/pages';
import { getGeneralSettings } from '@/services/generalSettings';
import { getTranslations } from 'next-intl/server';
import LoginForm from '@/components/account/login/LoginForm';
import LoginRedirectIfAuth from '@/components/account/login/LoginRedirectIfAuth';
import ActivationToast from '@/components/account/login/ActivationToast';
import type { Metadata } from 'next';
import SmallBreadcrumbsBlock from "@/components/breadcrumbs/SmallBreadcrumbsBlock";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account' });
  try {
    const pageInfo = await getPublicPageInfo('account-login', locale);
    return {
      title: pageInfo.title || t('loginPageTitle'),
      description: pageInfo.description,
      robots: {
        follow: pageInfo.follow,
        index: pageInfo.index,
      },
    };
  } catch {
    return {
      title: t('loginPageTitle'),
    };
  }
}

export default async function AccountLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getGeneralSettings(locale);
  const t = await getTranslations({ locale, namespace: 'Account' });

  return (
    <>
      <LoginRedirectIfAuth />
      <Suspense fallback={null}>
        <ActivationToast />
      </Suspense>
      <SmallBreadcrumbsBlock
        items={[
          { href: '/', name: settings.companyName },
          { name: t('loginPageTitle') },
        ]}
      />
      <div className="my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
        <div className="container">
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-20 p-5 sm:p-8 flex flex-col gap-6">
            <div className="text-center">
              <div className="heading2 mb-2">{t('loginPageTitle')}</div>
              <div className="text-sm text-gray-90">{t('loginSubtitle')}</div>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  );
}
