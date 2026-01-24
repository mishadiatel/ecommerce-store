'use client'

import { GetItemsResponse } from '@/types/getItemsResponse';
import { FullProductWithTranslations } from '@/types/product';
import ProductCard from '@/components/products/card/ProductCard';
import { useEffect, useRef, useState } from 'react';
import { getPublicProducts } from '@/services/product';
import { useParams } from 'next/navigation';
import Loader from '@/components/ui/loader/Loader';

interface SearchProductsListProps {
  searchData: GetItemsResponse<FullProductWithTranslations>;
  searchWord: string;
}

export default function SearchProductsList({searchData, searchWord}: SearchProductsListProps) {
  const [productsList, setProductsList] = useState<FullProductWithTranslations[]>(searchData.data);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(searchData.totalPages);
  const [loading, setLoading] = useState(false);
  const params = useParams();

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        if (loading) return;
        if (currentPage >= totalPages) return;
        setLoading(true);
        const nextPage = currentPage + 1;
        const data = await getPublicProducts({search: searchWord, page: nextPage, lang: String(params.locale)})
        setProductsList(prev => [...prev, ...data.data]);
        setCurrentPage(nextPage);
        setLoading(false);
      },
      { rootMargin: '300px' }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [currentPage, totalPages, loading, searchWord, params.locale]);

  return (
    <>
      <div className={'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4  gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8'}>
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
    </>
  )
}