'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MyOrder, getMyOrders } from '@/services/order';
import { useModalStore } from '@/stores/useModalStore';
import Loader from '@/components/ui/loader/Loader';
import axios from 'axios';

const PAGE_SIZE = 10;

const KNOWN_STATUSES = new Set([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
]);
const KNOWN_PAYMENT_STATUSES = new Set(['pending', 'paid', 'failed']);

function formatDate(value?: string) {
  if (!value) return '';
  try {
    const d = new Date(value);
    return d.toLocaleString();
  } catch {
    return value;
  }
}

export default function OrdersList() {
  const t = useTranslations();
  const openModal = useModalStore(s => s.openModal);

  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) return;
    if (totalPages !== null && page >= totalPages) return;

    const nextPage = page + 1;
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await getMyOrders(nextPage, PAGE_SIZE);
      setOrders(prev => {
        // dedupe by _id in case of repeat triggers
        const ids = new Set(prev.map(o => o._id));
        const merged = [...prev];
        for (const item of result.data) {
          if (!ids.has(item._id)) merged.push(item);
        }
        return merged;
      });
      setPage(nextPage);
      setTotalPages(result.totalPages);
    } catch (err) {
      let message = t('Account.orders.loadError');
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string | string[] } | undefined;
        const msg = data?.message;
        if (Array.isArray(msg)) message = msg.join(', ');
        else if (typeof msg === 'string') message = msg;
      }
      setError(message);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
      setInitialLoaded(true);
    }
  }, [page, totalPages, t]);

  // initial load
  useEffect(() => {
    void loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (totalPages !== null && page >= totalPages) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isLoadingRef.current) {
          void loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, page, totalPages]);

  const hasMore = totalPages === null || page < totalPages;

  return (
    <div className="flex flex-col gap-4">
      {orders.length === 0 && initialLoaded && !isLoading && !error && (
        <div className="text-center text-gray-90 py-10">
          {t('Account.orders.emptyMessage')}
        </div>
      )}

      {orders.map(order => {
        const statusLabel = KNOWN_STATUSES.has(order.status)
          ? t(`Account.orders.statuses.${order.status}`)
          : order.status;
        const paymentStatusLabel = KNOWN_PAYMENT_STATUSES.has(
          order.paymentStatus,
        )
          ? t(`Account.orders.paymentStatuses.${order.paymentStatus}`)
          : order.paymentStatus;
        const totalItems = order.items.reduce(
          (sum, i) => sum + i.quantity,
          0,
        );

        return (
          <div
            key={order._id}
            className="bg-white border border-gray-20 rounded-2xl p-4 sm:p-5 flex flex-col gap-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-xs uppercase text-gray-90">
                  {t('Account.orders.fields.orderNumber')}
                </div>
                <div className="font-semibold text-base sm:text-lg">
                  {order.orderNumber}
                </div>
              </div>
              <div className="text-sm text-gray-90">
                {formatDate(order.createdAt)}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="text-xs uppercase text-gray-90">
                  {t('Account.orders.fields.status')}
                </div>
                <div className="font-medium">{statusLabel}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-90">
                  {t('Account.orders.fields.paymentStatus')}
                </div>
                <div className="font-medium">{paymentStatusLabel}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-90">
                  {t('Product.productsCount', { count: totalItems })}
                </div>
                <div className="font-medium">{totalItems}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-90">
                  {t('Account.orders.fields.total')}
                </div>
                <div className="font-semibold text-primary-green">
                  {order.total} {t('Product.currencyUah')}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openModal('orderDetails', { orderId: order._id })
                }
                className="button-main !w-full sm:!w-fit text-center"
              >
                {t('Account.orders.showMoreButton')}
              </button>
            </div>
          </div>
        );
      })}

      {error && (
        <div className="text-red-700 text-sm text-center py-4">{error}</div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <Loader />
        </div>
      )}

      {/* sentinel for IntersectionObserver */}
      {hasMore && <div ref={sentinelRef} className="h-1" aria-hidden="true" />}
    </div>
  );
}
