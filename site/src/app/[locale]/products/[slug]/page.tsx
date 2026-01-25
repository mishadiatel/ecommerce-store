import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';
import { getPageBlocks } from '@/services/blocks';
import { getGeneralSettings } from '@/services/generalSettings';
import BlocksList from '@/components/blocks/BlocksList';
import BigBreadcrumbs from '@/components/breadcrumbs/BigBreadcrumbsBlock';
import { getPublicCategoryBySlug } from '@/services/category';
import { getPublicProducts } from '@/services/product';
import ProductsList from '@/components/products/list/ProductsList';

export async function generateMetadata({ params }: {params: Promise<{locale: string, slug: string}>}): Promise<Metadata> {
  const {locale, slug} = await params;
  const pageInfo = await getPublicPageInfo('category-products', locale);
  const categoryInfo = await getPublicCategoryBySlug(slug, locale);

  return {
    title: categoryInfo.translations[0].pageTitle,
    description: categoryInfo.translations[0].pageDescription,
    robots: {
      follow: pageInfo.follow,
      index: pageInfo.index
    }
  };
}

export default async function CategoryProductsPage({ params, searchParams }: {
  params: Promise<{locale: string, slug: string}>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale, slug } = await params;
  const {sortBy, sortOrder} = await searchParams;
  const topBlocks = await getPageBlocks('category-products', locale, true, false);
  const bottomBlocks = await getPageBlocks('category-products', locale, false, true);
  const settings = await getGeneralSettings(locale)
  const productsPageInfo = await getPublicPageInfo('products', locale)
  const categoryInfo = await getPublicCategoryBySlug(slug, locale);
  const productsInfo =  await getPublicProducts({
    lang: locale,
    category: categoryInfo._id,
    sortBy: sortBy ? String(sortBy) : undefined,
    sortOrder: sortOrder ? String(sortOrder) : undefined,
  }, false)
  return (
    <>
      <BlocksList blocks={topBlocks} />
      {categoryInfo.translations[0].name && (
        <BigBreadcrumbs title={categoryInfo.translations[0].name} items={[
          {href: '/', name: settings.companyName},
          {href: '/products', name: productsPageInfo.breadcrumbTitle!},
          {name: categoryInfo.translations[0].name}
        ]} />
      )}
      <ProductsList searchData={productsInfo} currentCategory={categoryInfo._id} />
      <BlocksList blocks={bottomBlocks} />
    </>
  )
}