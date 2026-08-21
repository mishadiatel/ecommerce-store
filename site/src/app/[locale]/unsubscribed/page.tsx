import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Subscribe.unsubscribe' });
  return {
    title: t('successTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function UnsubscribedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const isOk = String(sp.ok ?? '1') === '1';
  const t = await getTranslations({ locale, namespace: 'Subscribe.unsubscribe' });

  return (
    <div className="my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
      <div className="container">
        <div className="max-w-[600px] mx-auto text-center bg-extra-light-gray rounded-2xl sm:rounded-3xl p-6 sm:p-10">
          <div className="heading2 mb-4">
            {isOk ? t('successTitle') : t('errorTitle')}
          </div>
          <div className="text-base text-gray-90 mb-6">
            {isOk ? t('successText') : t('errorText')}
          </div>
          <Link href="/" className="button-main w-fit mx-auto inline-flex">
            {locale === 'ua' ? 'На головну' : 'Go home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
