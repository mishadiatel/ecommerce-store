import { GetItemsResponse } from '@/types/getItemsResponse';
import { FullProductWithTranslations } from '@/types/product';
import { FullCategoryWithTranslation } from '@/types/category';
import { notFound } from 'next/navigation';

export interface GetProductsParams {
  search?: string;
  page?: number;
  limit?: number;
  lang?: string;
  isNew?: boolean;
  isLimited?: boolean;
  isOnSale?: boolean;
  isOnePlusOne?: boolean;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  inStockOnly?: boolean;
}

export async function getPublicProducts(searchParams: GetProductsParams, cache = false): Promise<GetItemsResponse<FullProductWithTranslations>> {
  const {
    search,
    page = 1,
    limit = 20,
    lang = 'ua',
    isNew,
    isLimited,
    isOnSale,
    isOnePlusOne,
    category,
    sortBy,
    sortOrder,
    minPrice,
    maxPrice,
    inStockOnly,
  } = searchParams;

  const params = new URLSearchParams();

  if (search) params.set('search', search);
  if (page) params.set('page', String(page));
  if (limit) params.set('limit', String(limit));
  if (lang) params.set('lang', lang);

  if (isNew) params.set('isNew', String(isNew));
  if (isLimited) params.set('isLimited', String(isLimited));
  if (isOnSale) params.set('isOnSale', String(isOnSale));
  if (isOnePlusOne)
    params.set('isOnePlusOne', String(isOnePlusOne));

  if (category) params.set('category', category);
  if (sortBy) params.set('sortBy', sortBy);
  if (sortOrder) params.set('sortOrder', sortOrder);

  if (minPrice !== undefined && minPrice !== '') params.set('minPrice', String(minPrice));
  if (maxPrice !== undefined && maxPrice !== '') params.set('maxPrice', String(maxPrice));
  if (inStockOnly) params.set('inStockOnly', 'true');

  const requestOptions: RequestInit & {
    next?: {
      revalidate?: number;
      tags?: string[];
    };
  } = {
    ...(cache
      ? {
        next: {
          revalidate: 3600,
          tags: ['products'],
        },
      }
      : {
        cache: 'no-store',
      }),
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/product/public?${params.toString()}`, requestOptions);

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}


export async function getPublicProductBySlug(slug: string, lang: string): Promise<FullProductWithTranslations> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/product/${slug}/public?lang=${lang}`, {
    next: { tags: ['product-slug'] },
    cache: 'no-store',
  });

  if (!res.ok) {
    // throw new Error('Failed to fetch category');
    return notFound();
  }

  return res.json();
}


export async function getProductByIdsArray(ids: string[], lang: string): Promise<FullProductWithTranslations[]> {
  if (ids.length === 0) {
    return [];
  }

  const idsPrams = ids.map(id => `ids=${id}`).join('&');

  const res = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/product/publicByIdsArray?lang=${lang}&${idsPrams}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}