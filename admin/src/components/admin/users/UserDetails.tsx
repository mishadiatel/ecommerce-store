'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  ShoppingCart,
  User,
} from 'lucide-react';
import { getAdminUserDetails } from '@/services/adminUsers';
import OrderCard from '@/components/admin/orders/card/OrderCard';
import type { AdminUserDetails } from '@/types/adminUser';

interface Props {
  userId: string;
}

export default function UserDetails({ userId }: Props) {
  const t = useTranslations('userDetails');
  const [data, setData] = useState<AdminUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);
    getAdminUserDetails(userId)
      .then((res) => setData(res ?? null))
      .catch(() => toast.error(t('loadError')))
      .finally(() => setIsLoading(false));
  }, [userId, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">…</div>
    );
  }
  if (!data) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        {t('notFound')}
      </div>
    );
  }

  const { user, cart, orders, ordersSummary } = data;
  const fullName =
    user.firstName || user.lastName
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : t('noName');

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/adminPanel/admin823479234/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToUsers')}
      </Link>

      {/* Профіль користувача */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <User className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">{fullName}</h2>
              {user.role === 'admin' && (
                <span className="px-2 py-0.5 rounded-md text-xs bg-purple-500/15 text-purple-700 dark:text-purple-300 font-medium">
                  admin
                </span>
              )}
              {user.isActivated ? (
                <span className="px-2 py-0.5 rounded-md text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('activated')}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-xs bg-gray-500/15 text-gray-700 dark:text-gray-300 font-medium">
                  {t('notActivated')}
                </span>
              )}
            </div>
            <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </span>
              {user.phoneNumber && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {user.phoneNumber}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-right">
            <div>
              <div className="text-xs text-muted-foreground">
                {t('totalOrders')}
              </div>
              <div className="text-lg font-semibold tabular-nums">
                {ordersSummary.totalOrders}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                {t('totalRevenue')}
              </div>
              <div className="text-lg font-semibold tabular-nums">
                {ordersSummary.totalRevenue} ₴
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                {t('paidRevenue')}
              </div>
              <div className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {ordersSummary.paidRevenue} ₴
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Активна корзина (якщо є) */}
      {cart && cart.items.length > 0 && (
        <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/5 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">
              {t('abandonedCartTitle')}
            </h3>
            <span className="text-xs text-amber-700 dark:text-amber-300">
              {t('abandonedCartSubtitle', {
                count: cart.totalQuantity,
                total: cart.estimatedTotal,
              })}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 p-2 rounded-md bg-background/50"
              >
               
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                  </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {item.name ?? t('unknownProduct')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.quantity} × {item.price ?? '—'} ₴
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {item.price ? item.quantity * item.price : '—'} ₴
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Замовлення */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          {t('ordersHistory', { count: orders.length })}
        </h3>
        {orders.length === 0 ? (
          <div className="py-6 rounded-xl border border-border bg-card text-center text-sm text-muted-foreground">
            {t('noOrders')}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                updateOrdersList={load}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
