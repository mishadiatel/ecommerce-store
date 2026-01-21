import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';
import { getPageBlocks } from '@/services/blocks';
import BlocksList from '@/components/blocks/BlocksList';
import { getGeneralSettings } from '@/services/generalSettings';
import BigBreadcrumbs from '@/components/breadcrumbs/BigBreadcrumbsBlock';

export async function generateMetadata({ params }: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const pageInfo = await getPublicPageInfo('faq', locale);

  return {
    title: `${pageInfo.title}`,
    description: pageInfo.description,
    robots: {
      follow: pageInfo.index,
      index: pageInfo.index
    }
  };
}

export default async function FaqPage({ params }: {params: Promise<{locale: string}>}) {
  const { locale } = await params;

  const topBlocks = await getPageBlocks('faq', locale, true, false);
  const bottomBlocks = await getPageBlocks('faq', locale, false, true);
  const settings = await getGeneralSettings(locale)
  const pageInfo = await getPublicPageInfo('faq', locale);

  return (
    <>
      <BlocksList blocks={topBlocks} />
      {pageInfo.breadcrumbTitle && (
        <BigBreadcrumbs title={pageInfo.breadcrumbTitle} items={[
          {href: '/', name: settings.companyName},
          {name: pageInfo.breadcrumbTitle}
        ]} />
      )}
      <BlocksList blocks={bottomBlocks} />
    </>
  )
}