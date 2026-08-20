import { projectApi } from '@/lib/axios';

export interface PopularQuery {
  _id: string;
  queryText: string;
  language: string;
  visible: boolean;
}

/**
 * Публічний список видимих популярних запитів для поточної мови сайту.
 * Використовується у модалці пошуку.
 */
export const getPopularQueries = async (
  language?: string,
  limit: number = 20,
): Promise<PopularQuery[]> => {
  try {
    const { data } = await projectApi.get<PopularQuery[]>(
      '/api/popular-query/public',
      { params: { language, limit } },
    );
    return data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};
