import { Suspense } from 'react';
import { getGeneralSettings } from '@/services/generalSettings';
import { getTranslations } from 'next-intl/server';
import VerifyEmailBlock from '@/components/account/verifyEmail/VerifyEmailBlock';
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
    title: t('verifyEmail.title'),
    robots: { index: false, follow: false },
  };
}

export default async function AccountVerifyEmailPage({
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
          { href: '/account/login', name: t('personalAccountTitle') },
          { name: t('loginPageTitle') },
        ]}
      />
      <Suspense fallback={null}>
        <VerifyEmailBlock />
      </Suspense>
    </>
  );
}
