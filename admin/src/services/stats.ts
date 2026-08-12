import { projectApi } from '@/lib/axios';
import { OrderStatsSummary, TopProduct, TimelinePoint } from '@/types/stats';

interface DateRangeParams {
  dateFrom?: string;
  dateTo?: string;
}

export const getOrderStatsSummary = async (
  params: DateRangeParams = {},
): Promise<OrderStatsSummary | undefined> => {
  try {
    const { data } = await projectApi.get<OrderStatsSummary>(
      '/api/order/stats/summary',
      { params },
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getTopProducts = async (
  params: DateRangeParams & {
    limit?: number;
    sortBy?: 'revenue' | 'quantity';
  } = {},
): Promise<TopProduct[] | undefined> => {
  try {
    const { data } = await projectApi.get<TopProduct[]>(
      '/api/order/stats/top-products',
      { params },
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getOrdersTimeline = async (
  params: DateRangeParams & { granularity?: 'day' | 'week' | 'month' } = {},
): Promise<TimelinePoint[] | undefined> => {
  try {
    const { data } = await projectApi.get<TimelinePoint[]>(
      '/api/order/stats/timeline',
      { params },
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
