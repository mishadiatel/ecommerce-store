import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';
import { getPublicCategoryById } from '@/services/category';
import { getPageBlocks } from '@/services/blocks';
import { getGeneralSettings } from '@/services/generalSettings';
import { getPublicProductBySlug, getPublicProducts } from '@/services/product';
import BlocksList from '@/components/blocks/BlocksList';
import SmallBreadcrumbsBlock from '@/components/breadcrumbs/SmallBreadcrumbsBlock';
import ProductPage from '@/components/products/productPage/ProductPage';

export async function generateMetadata({ params }: {
  params: Promise<{ locale: string, slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const pageInfo = await getPublicPageInfo('product-page', locale);
  const productInfo = await getPublicProductBySlug(slug, locale);

  return {
    title: productInfo.translations[0].title,
    description: productInfo.translations[0].title,
    robots: {
      follow: pageInfo.follow,
      index: pageInfo.index,
    },
  };
}

export default async function ProductInfoPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;
  const topBlocks = await getPageBlocks('product-page', locale, true, false);
  const bottomBlocks = await getPageBlocks('product-page', locale, false, true);
  const settings = await getGeneralSettings(locale);
  const productsPageInfo = await getPublicPageInfo('products', locale);
  const productInfo = await getPublicProductBySlug(slug, locale);
  const productCategoryInfo = await getPublicCategoryById(productInfo.categoryId, locale);
  const sameCategoryProducts = await getPublicProducts({lang: locale, category: productCategoryInfo._id})

  return (
    <>
      <BlocksList blocks={topBlocks} />
      {productInfo.translations[0].title && settings.companyName && productCategoryInfo.translations[0].name && (
        <SmallBreadcrumbsBlock items={[
          { href: '/', name: settings.companyName },
          { href: '/products', name: productsPageInfo.breadcrumbTitle! },
          { href: `/products/${productCategoryInfo.slug}`, name: productCategoryInfo.translations[0].name },
          { name: productInfo.translations[0].title },
        ]} />
      )}
      <ProductPage sameCategoryProducts={sameCategoryProducts} productInfo={productInfo} />
      <BlocksList blocks={bottomBlocks} />
    </>
  );
}