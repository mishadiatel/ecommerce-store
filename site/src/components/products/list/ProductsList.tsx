'use client';
import { GetItemsResponse } from '@/types/getItemsResponse';
import { FullProductWithTranslations } from '@/types/product';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getPublicProducts } from '@/services/product';
import ProductCard from '@/components/products/card/ProductCard';
import Loader from '@/components/ui/loader/Loader';
import { useTranslations } from 'next-intl';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { Link, useRouter } from '@/i18n/navigation';
import { useCategories } from '@/context/categoriesContext/CategoriesContext';

interface ProductsListProps {
  searchData: GetItemsResponse<FullProductWithTranslations>;
  currentCategory: string;
}

export default function ProductsList({ searchData, currentCategory }: ProductsListProps) {
  const [productsList, setProductsList] = useState<FullProductWithTranslations[]>(searchData.data);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(searchData.totalPages);
  const [totalDocuments, setTotalDocuments] = useState(searchData.totalDocuments);
  const [loading, setLoading] = useState(false);
  const [isOpenMobileFilters, setIsOpenMobileFilters] = useState(false);
  const params = useParams();
  const t = useTranslations('Product');

  const observerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParams = new URLSearchParams(searchParams.toString());
  const [pageSortBy, setPageSortBy] = useState(pageParams.get('sortBy') || undefined);
  const [pageSortOrder, setPageSortOrder] = useState(pageParams.get('sortOrder') || undefined);
  const isInitialMount = useRef(true);
  const categories = useCategories();

  const sortOptions = [
    {
      id: 'default',
      text: t('sort.defaultTypeText'),
      options: {},
      isDefault: true,
    },
    {
      id: 'priceasc',
      text: t('sort.priceAscText'),
      options: {
        sortBy: 'cost',
        sortOrder: 'asc',
      },
      isDefault: false,
    },
    {
      id: 'pricedesc',
      text: t('sort.priceDescText'),
      options: {
        sortBy: 'cost',
        sortOrder: 'desc',
      },
      isDefault: false,
    },
  ];

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    async function fetchProductsWithNewOptions() {
      setLoading(true);
      setCurrentPage(1);

      const sortBy = searchParams.get('sortBy') || undefined;
      const sortOrder = searchParams.get('sortOrder') || undefined;

      const data = await getPublicProducts({
        category: currentCategory,
        page: 1, // reset page on sort/filter change
        lang: String(params.locale),
        sortBy,
        sortOrder,
      });

      setProductsList(data.data);
      setLoading(false);
      setTotalDocuments(data.totalDocuments);
      setTotalPages(data.totalPages);
    }

    fetchProductsWithNewOptions();
  }, [searchParams, currentCategory, params.locale]);

  const updateSortOptions = (options: { sortBy?: string, sortOrder?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    const { sortBy, sortOrder } = options;

    if (sortBy && sortOrder) {
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      setPageSortBy(sortBy);
      setPageSortOrder(sortOrder);
    } else {
      params.delete('sortBy');
      params.delete('sortOrder');
      setPageSortBy(undefined);
      setPageSortOrder(undefined);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };


  const selectedSortType =
    ((pageSortBy && pageSortOrder) ?
      sortOptions.find(el => el.options.sortBy === pageSortBy && el.options.sortOrder === pageSortOrder) :
      sortOptions.find(el => el.isDefault))
    || sortOptions[0];

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        if (loading) return;
        if (currentPage >= totalPages) return;
        setLoading(true);
        const nextPage = currentPage + 1;
        const data = await getPublicProducts({
          category: currentCategory,
          page: nextPage,
          lang: String(params.locale),
          sortBy: pageSortBy,
          sortOrder: pageSortOrder,
        });
        setTotalDocuments(data.totalDocuments);
        setTotalPages(data.totalPages);
        setProductsList(prev => [...prev, ...data.data]);
        setCurrentPage(nextPage);
        setLoading(false);
      },
      { rootMargin: '300px' },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [currentCategory, pageSortBy, pageSortOrder, params.locale, currentPage, loading, totalPages]);

  return (
    <>
      <div className="shop-product breadcrumb1 my-[64px] sm:my-[80px] lg:my-[100px] !mt-0">
        <div className="container">
          <div className="flex max-md:flex-wrap gap-y-8">
            <div className="list-product-block style-grid w-full lg:w-3/4">
              <div
                className="filter-heading flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 flex-wrap mb-4 lg:mb-5">
              <span
                className="text-black text-xl sm:text-[28px] lg:text-xl">{t('productsCount', { count: Number(totalDocuments) ?? 0 })}</span>

                <div className="flex justify-between items-center">
                  <div className="flex items-center justify-between lg:hidden">
                    <button type="button" className="flex items-center gap-3 "
                            onClick={() => setIsOpenMobileFilters(true)}><i
                      className="icon icon-filter"></i><span>{t('filters')}</span></button>
                  </div>

                  <Dropdown
                    options={sortOptions}
                    initialSelected={selectedSortType}
                    dropdownContainerClass={'sort-product right ml-auto relative'}
                  >
                    {({
                        isOpen,
                        toggle,
                        listRef,
                      }) => (
                      <>
                        <button
                          onClick={toggle}
                          className={`flex items-center gap-3 dropdown-button ${isOpen ? 'open' : ''}`}
                          type="button">
                          <i className="block lg:hidden icon icon-sort"></i>
                          <span className="hidden lg:block heading6">{t('sort.label')}:</span>
                          <span
                            className="hidden lg:block text-base text-black js--dropdown-toggle-text">{selectedSortType.text}</span>
                          <i className="hidden lg:block icon icon-chevron-down"></i>
                          <span className="block lg:hidden">{t('sort.label')}</span>
                        </button>
                        <div className={`dropdown ${isOpen ? 'open' : ''}`}>
                          <ul
                            ref={listRef}
                            className="flex flex-col gap-3"
                          >
                            {sortOptions.map((item) => {
                              return (
                                <li
                                  key={item.id}
                                  onClick={() => updateSortOptions(item.options)}
                                  className={`caption2`}
                                >
                                  <div
                                    className={`dropdown-item ${item.id === selectedSortType.id ? 'active' : ''}`}
                                  >
                                    {item.text}
                                    <i className="icon icon-tick-small ml-2"></i>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                      </>
                    )}
                  </Dropdown>
                </div>
              </div>

              <div
                className="list-product1 hide-product-sold grid sm:grid-cols-3 grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-7">
                {productsList.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div ref={observerRef} className="h-1" />
              {loading && (
                <div className={'flex justify-center items-center mb-6 lg:mb-8 '}>
                  <Loader />
                </div>
              )}
            </div>

            <div className={`sidebar ${isOpenMobileFilters ? 'open' : ''}`}>
              <div className="container lg:p-0 lg:w-full lg:max-w-full">
                <div
                  className="flex lg:hidden justify-between items-center pb-4 mb-4 sm:pb-6 sm:mb-6 border-b border-b-gray-20">
                  <span className="heading1">{t('filters')}</span>
                  <button type={'button'} onClick={() => setIsOpenMobileFilters(false)}><i
                    className="icon icon-x text-[28px]"></i>
                  </button>
                </div>

                <Dropdown
                  options={[]}
                  initialOpenState={true}
                  // initialSelected={selectedSortType}
                  dropdownContainerClass={'mb-4'}
                  disableAutoClose={true}
                >
                  {({
                      isOpen,
                      toggle,
                    }) => (
                    <>
                      <div className={`filter-dropdown ${isOpen ? 'open' : ''}`}>
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={toggle}
                        >
                          <div className="text-black text-xl">
                            {t('categories')}
                          </div>
                          <div className="dropdown-icon">
                            <i className="icon icon-plus"></i>
                            <i className="icon icon-minus"></i>
                          </div>
                        </div>

                        <div className="filter-dropdown-content mt-4" >
                          <div className="flex flex-col gap-4 items-start">
                            <Link href={'/products'} className="filter-link">{t('allCategories')}</Link>
                            {categories && categories.length > 0 && categories.map(category => (
                              <Link
                                key={`${category._id}_filter`}
                                href={`/products/${category.slug}`}
                                className={`filter-link ${params.slug === category.slug ? 'active' : ''}`}
                              >{category.translations[0].name}</Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Dropdown>


              </div>
              <div className="fixed bottom-0 left-0 right-0 lg:hidden">
                <div className="container py-5 flex gap-4 sm:gap-6 bg-white border-t border-t-gray-20">
                  <button type="button"
                          className="button-main bordered flex-grow !min-w-0 !p-4 w-1/2"
                          onClick={() => setIsOpenMobileFilters(false)}
                  >
                    {t('deselectButtonText')}
                  </button>

                  <button
                    type="button"
                    className="button-main flex-grow !min-w-0 !p-4 w-1/2"
                    onClick={() => setIsOpenMobileFilters(false)}>
                    {t('applyButtonText')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}