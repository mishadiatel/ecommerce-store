import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';
import { getPageBlocks } from '@/services/blocks';
import { getGeneralSettings } from '@/services/generalSettings';
import BlocksList from '@/components/blocks/BlocksList';
import BigBreadcrumbs from '@/components/breadcrumbs/BigBreadcrumbsBlock';
import CartPageList from '@/components/cart/cartPageList/CartPageList';
import SmallBreadcrumbsBlock from '@/components/breadcrumbs/SmallBreadcrumbsBlock';
import CheckoutPageComponent from '@/components/checkout/checkoutPage/CheckoutPageComponent';

export async function generateMetadata({ params }: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const pageInfo = await getPublicPageInfo('checkout', locale);

  return {
    title: `${pageInfo.title}`,
    description: pageInfo.description,
    robots: {
      follow: pageInfo.follow,
      index: pageInfo.index
    }
  };
}

export default async function CheckoutPage({ params }: {
  params: Promise<{locale: string}>,
}) {
  const { locale } = await params;
  const topBlocks = await getPageBlocks('checkout', locale, true, false);
  const bottomBlocks = await getPageBlocks('checkout', locale, false, true);
  const settings = await getGeneralSettings(locale);
  const pageInfo = await getPublicPageInfo('checkout', locale);


  return (
    <>
      <BlocksList blocks={topBlocks} />
      {pageInfo.breadcrumbTitle && (
        <SmallBreadcrumbsBlock items={[
          { href: '/', name: settings.companyName },
          { name: pageInfo.breadcrumbTitle }
        ]} />
      )}
      <CheckoutPageComponent pageInfo={pageInfo} />
      <BlocksList blocks={bottomBlocks} />
    </>
  )
}