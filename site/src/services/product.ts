import { GetItemsResponse } from '@/types/getItemsResponse';
import { FullProductWithTranslations } from '@/types/product';

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
}

export async function getPublicProducts(searchParams: GetProductsParams, cache=false): Promise<GetItemsResponse<FullProductWithTranslations>> {
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
    sortOrder
  } = searchParams

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
  if(sortBy) params.set('sortBy', sortBy);
  if (sortOrder) params.set('sortOrder', sortOrder);

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