import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';
import { getPageBlocks } from '@/services/blocks';
import { getGeneralSettings } from '@/services/generalSettings';
import BlocksList from '@/components/blocks/BlocksList';
import BigBreadcrumbs from '@/components/breadcrumbs/BigBreadcrumbsBlock';

export async function generateMetadata({ params }: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const pageInfo = await getPublicPageInfo('products', locale);

  return {
    title: `${pageInfo.title}`,
    description: pageInfo.description,
    robots: {
      follow: pageInfo.follow,
      index: pageInfo.index
    }
  };
}

export default async function CategoriesPage({ params }: {params: Promise<{locale: string}>}) {
  const { locale } = await params;

  const topBlocks = await getPageBlocks('products', locale, true, false);
  const bottomBlocks = await getPageBlocks('products', locale, false, true);
  const settings = await getGeneralSettings(locale)
  const pageInfo = await getPublicPageInfo('products', locale);

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