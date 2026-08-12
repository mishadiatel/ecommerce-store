'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/shadcnuiComponents/select';
import {
  getOrderStatsSummary,
  getOrdersTimeline,
  getTopProducts,
} from '@/services/stats';
import type {
  OrderStatsSummary,
  TimelinePoint,
  TopProduct,
} from '@/types/stats';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#22c55e',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#22c55e',
  failed: '#ef4444',
};

const CUSTOMER_TYPE_COLORS: Record<string, string> = {
  guest: '#94a3b8',
  registered: '#8b5cf6',
};

function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(
    value,
  );
}

export default function StatsDashboard() {
  const t = useTranslations('stats');
  const [dateFrom, setDateFrom] = useState<string>(todayISO(-29));
  const [dateTo, setDateTo] = useState<string>(todayISO(0));
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>(
    'day',
  );
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity'>('revenue');
  const [isLoading, setIsLoading] = useState(true);

  const [summary, setSummary] = useState<OrderStatsSummary | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getOrderStatsSummary({ dateFrom, dateTo }),
      getOrdersTimeline({ dateFrom, dateTo, granularity }),
      getTopProducts({ dateFrom, dateTo, limit: 10, sortBy }),
    ])
      .then(([s, tl, tp]) => {
        setSummary(s ?? null);
        setTimeline(tl ?? []);
        setTopProducts(tp ?? []);
      })
      .catch(() => toast.error(t('loadError')))
      .finally(() => setIsLoading(false));
  }, [dateFrom, dateTo, granularity, sortBy, t]);

  const KNOWN_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
  const KNOWN_PAYMENTS = ['pending', 'paid', 'failed'];

  const statusData = useMemo(
    () =>
      (summary?.statusBreakdown ?? []).map((s) => ({
        name: KNOWN_STATUSES.includes(s.status)
          ? t(`status.${s.status}` as never)
          : s.status,
        value: s.count,
        revenue: s.revenue,
        rawStatus: s.status,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summary, t],
  );

  const paymentData = useMemo(
    () =>
      (summary?.paymentBreakdown ?? []).map((p) => ({
        name: KNOWN_PAYMENTS.includes(p.paymentStatus)
          ? t(`payment.${p.paymentStatus}` as never)
          : p.paymentStatus,
        value: p.count,
        revenue: p.revenue,
        rawStatus: p.paymentStatus,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summary, t],
  );

  const customerTypeData = useMemo(() => {
    const items = summary?.customerTypeBreakdown ?? [];
    const total = items.reduce((s, i) => s + i.count, 0) || 1;
    return items.map((c) => ({
      name: t(`customerType.${c.type}`),
      value: c.count,
      revenue: c.revenue,
      percent: Math.round((c.count / total) * 100),
      rawType: c.type,
    }));
  }, [summary, t]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Фільтри періоду ────────────────────────────────────────── */}
      <div className="admin-filters">
        <div className="admin-filter-date flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">
            {t('dateFromLabel')}
          </label>
          <Input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="admin-filter-date flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">
            {t('dateToLabel')}
          </label>
          <Input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="admin-filter-select">
          <label className="text-xs text-muted-foreground">
            {t('granularityLabel')}
          </label>
          <Select
            value={granularity}
            onValueChange={(v) =>
              setGranularity(v as 'day' | 'week' | 'month')
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{t('granularity.day')}</SelectItem>
              <SelectItem value="week">{t('granularity.week')}</SelectItem>
              <SelectItem value="month">{t('granularity.month')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="admin-filter-select">
          <label className="text-xs text-muted-foreground">
            {t('sortByLabel')}
          </label>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as 'revenue' | 'quantity')}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">{t('sortBy.revenue')}</SelectItem>
              <SelectItem value="quantity">{t('sortBy.quantity')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          label={t('kpi.totalOrders')}
          value={summary?.totalOrders ?? 0}
          isLoading={isLoading}
        />
        <KpiCard
          label={t('kpi.totalRevenue')}
          value={formatCurrency(summary?.totalRevenue ?? 0) + ' ₴'}
          isLoading={isLoading}
        />
        <KpiCard
          label={t('kpi.paidRevenue')}
          value={formatCurrency(summary?.paidRevenue ?? 0) + ' ₴'}
          isLoading={isLoading}
          highlight="green"
        />
        <KpiCard
          label={t('kpi.paidOrders')}
          value={summary?.paidOrders ?? 0}
          isLoading={isLoading}
        />
        <KpiCard
          label={t('kpi.avgOrderValue')}
          value={formatCurrency(summary?.avgOrderValue ?? 0) + ' ₴'}
          isLoading={isLoading}
        />
        <KpiCard
          label={t('kpi.totalItems')}
          value={summary?.totalItems ?? 0}
          isLoading={isLoading}
        />
      </div>

      {/* ── Часовий ряд ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-base">{t('charts.timelineTitle')}</h3>
          <p className="text-xs text-muted-foreground">
            {t('charts.timelineSubtitle')}
          </p>
        </div>
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="bucket" fontSize={12} />
              <YAxis yAxisId="left" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name={t('charts.ordersLine')}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name={t('charts.revenueLine')}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="paidRevenue"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
                name={t('charts.paidRevenueLine')}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Три пироги: статус, оплата, тип клієнта ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PieCard
          title={t('charts.statusBreakdown')}
          data={statusData}
          colors={STATUS_COLORS}
          isLoading={isLoading}
        />
        <PieCard
          title={t('charts.paymentBreakdown')}
          data={paymentData}
          colors={PAYMENT_COLORS}
          isLoading={isLoading}
        />
        <PieCard
          title={t('charts.customerTypeBreakdown')}
          data={customerTypeData}
          colors={CUSTOMER_TYPE_COLORS}
          isLoading={isLoading}
        />
      </div>

      {/* ── Топ-товарів ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-base">{t('charts.topProductsTitle')}</h3>
          <p className="text-xs text-muted-foreground">
            {t('charts.topProductsSubtitle', {
              sortBy: t(`sortBy.${sortBy}`),
            })}
          </p>
        </div>
        {topProducts.length === 0 ? (
          <div className="py-8 text-sm text-muted-foreground text-center">
            {t('empty')}
          </div>
        ) : (
          <>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    fontSize={11}
                    width={160}
                    tickFormatter={(v: string) =>
                      v.length > 25 ? v.slice(0, 22) + '…' : v
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                  <Bar
                    dataKey={sortBy}
                    fill={sortBy === 'revenue' ? '#22c55e' : '#3b82f6'}
                    name={t(`sortBy.${sortBy}`)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Таблиця */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">{t('table.product')}</th>
                    <th className="py-2 pr-3 text-right">{t('table.quantity')}</th>
                    <th className="py-2 pr-3 text-right">{t('table.revenue')}</th>
                    <th className="py-2 pr-3 text-right">{t('table.orders')}</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, idx) => (
                    <tr key={p.productId} className="border-b border-border/50">
                      <td className="py-2 pr-3 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 pr-3 font-medium">{p.name}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{p.quantity}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {formatCurrency(p.revenue)} ₴
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {p.ordersCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-компоненти ────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  isLoading,
  highlight,
}: {
  label: string;
  value: string | number;
  isLoading?: boolean;
  highlight?: 'green' | 'red';
}) {
  const highlightClass =
    highlight === 'green'
      ? 'text-emerald-600 dark:text-emerald-400'
      : highlight === 'red'
        ? 'text-red-600 dark:text-red-400'
        : '';
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-xl font-semibold ${highlightClass}`}>
        {isLoading ? '…' : value}
      </div>
    </div>
  );
}

interface PieDatum {
  name: string;
  value: number;
  revenue?: number;
  percent?: number;
  rawStatus?: string;
  rawType?: string;
}

function PieCard({
  title,
  data,
  colors,
  isLoading,
}: {
  title: string;
  data: PieDatum[];
  colors: Record<string, string>;
  isLoading?: boolean;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
      <h3 className="font-semibold text-base mb-3">{title}</h3>
      {isLoading || data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-8">
          {isLoading ? '…' : '—'}
        </div>
      ) : (
        <>
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ percent }) =>
                    percent ? `${Math.round(percent * 100)}%` : ''
                  }
                >
                  {data.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        colors[d.rawStatus ?? d.rawType ?? ''] ??
                        '#94a3b8'
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-col gap-1 text-xs">
            {data.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{
                      background:
                        colors[d.rawStatus ?? d.rawType ?? ''] ?? '#94a3b8',
                    }}
                  />
                  <span>{d.name}</span>
                </div>
                <div className="tabular-nums text-muted-foreground">
                  {d.value}
                  {total > 0
                    ? ` (${Math.round((d.value / total) * 100)}%)`
                    : ''}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
