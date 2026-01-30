import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';
import { getPageBlocks } from '@/services/blocks';
import { getGeneralSettings } from '@/services/generalSettings';
import BlocksList from '@/components/blocks/BlocksList';
import BigBreadcrumbs from '@/components/breadcrumbs/BigBreadcrumbsBlock';
import WishlistList from '@/components/products/wishlistList/WishlistList';

export async function generateMetadata({ params }: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const pageInfo = await getPublicPageInfo('wishlist', locale);

  return {
    title: `${pageInfo.title}`,
    description: pageInfo.description,
    robots: {
      follow: pageInfo.follow,
      index: pageInfo.index
    }
  };
}

export default async function WishlistPage({ params }: {
  params: Promise<{locale: string}>,
}) {
  const { locale } = await params;
  const topBlocks = await getPageBlocks('wishlist', locale, true, false);
  const bottomBlocks = await getPageBlocks('wishlist', locale, false, true);
  const settings = await getGeneralSettings(locale)
  const pageInfo = await getPublicPageInfo('wishlist', locale);


  return (
    <>
      <BlocksList blocks={topBlocks} />
      {pageInfo.breadcrumbTitle && (
        <BigBreadcrumbs title={pageInfo.breadcrumbTitle} items={[
          { href: '/', name: settings.companyName },
          { name: pageInfo.breadcrumbTitle }
        ]} />
      )}
      <WishlistList />
      <BlocksList blocks={bottomBlocks} />
    </>
  )
}