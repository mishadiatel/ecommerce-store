import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';
import { getPageBlocks } from '@/services/blocks';
import { getGeneralSettings } from '@/services/generalSettings';
import BlocksList from '@/components/blocks/BlocksList';
import BigBreadcrumbs from '@/components/breadcrumbs/BigBreadcrumbsBlock';
import { getPublicProducts } from '@/services/product';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import SearchProductsList from '@/components/search/list/SearchProductsList';

export async function generateMetadata({ params }: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const pageInfo = await getPublicPageInfo('search', locale);

  return {
    title: `${pageInfo.title}`,
    description: pageInfo.description,
    robots: {
      follow: pageInfo.follow,
      index: pageInfo.index
    }
  };
}

export default async function SearchPage({ params, searchParams }: {
  params: Promise<{locale: string}>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const t = await getTranslations('Search');
  const { locale } = await params;
  const topBlocks = await getPageBlocks('search', locale, true, false);
  const bottomBlocks = await getPageBlocks('search', locale, false, true);
  const settings = await getGeneralSettings(locale)
  const pageInfo = await getPublicPageInfo('search', locale);
  const searchWord  = String((await searchParams).term).trim().toLowerCase() || '';
  let searchProducts;
  if(searchWord) {
    searchProducts = await getPublicProducts({
      search: searchWord,
      lang: locale
    }, false)
  }


  return (
    <>
      <BlocksList blocks={topBlocks} />
      {pageInfo.breadcrumbTitle && (
        <BigBreadcrumbs title={pageInfo.breadcrumbTitle} items={[
          { href: '/', name: settings.companyName },
          { name: pageInfo.breadcrumbTitle }
        ]} />
      )}
      <div className="my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
        <div className="container">
          {searchWord ?
            (
              <>
                {searchProducts && searchProducts.totalDocuments > 0 ? (
                  <>
                    <div
                      className="font-semibold lg:font-bold text-center text-xl sm:text-[22px] lg:text-[32px] mb-5 sm:mb-6 lg:mb-8">
                      {t('resultsCount', {query: searchWord, count: searchProducts.totalDocuments})}
                    </div>
                    <SearchProductsList
                      key={searchWord}
                      searchData={searchProducts}
                      searchWord={searchWord}
                    />
                  </>
                  ) :
                  (
                  <>
                    <div
                      className="font-semibold lg:font-bold text-center text-xl sm:text-[22px] lg:text-[32px] mb-5 sm:mb-6 lg:mb-8">
                      {t('noResultsFound', {query: searchWord})}
                    </div>
                    <div className="text-center text-base sm:text-lg mb-6 lg:mb-12 text-gray-90">
                      {t('tryLetter')}
                    </div>
                  </>
                  )
                }
              </>
            ) :
            (
              <>
                <div
                  className="font-semibold lg:font-bold text-center text-xl sm:text-[22px] lg:text-[32px] mb-5 sm:mb-6 lg:mb-8">
                  {t('emptySearchWordMessage')}
                </div>
                <div className="text-center text-base sm:text-lg mb-6 lg:mb-12 text-gray-90">
                  {t('tryLetter')}
                </div>
              </>
            )
          }
          <div className="flex flex-col items-center gap-8">
            <Link href={'/products'} className="button-main w-full sm:w-fit">{t('catalogButtonText')}</Link>
          </div>
        </div>
      </div>
      <BlocksList blocks={bottomBlocks} />
    </>
  )
}