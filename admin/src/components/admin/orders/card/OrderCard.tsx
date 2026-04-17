import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/shadcnuiComponents/select';
import { Order, OrderStatus } from '@/types/order';
import { markAdminOrderAsPaid, updateAdminOrderStatus } from '@/services/order';

interface OrderCardProps {
  order: Order;
  updateOrdersList: () => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 ring-1 ring-yellow-500/30',
  processing: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 ring-1 ring-blue-500/30',
  shipped: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/30',
  delivered: 'bg-green-500/15 text-green-600 dark:text-green-300 ring-1 ring-green-500/30',
  completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-600 dark:text-red-300 ring-1 ring-red-500/30',
};

const paymentColors: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 ring-1 ring-yellow-500/30',
  paid: 'bg-green-500/15 text-green-600 dark:text-green-300 ring-1 ring-green-500/30',
  failed: 'bg-red-500/15 text-red-600 dark:text-red-300 ring-1 ring-red-500/30',
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function OrderCard({ order, updateOrdersList }: OrderCardProps) {
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const [status, setStatus] = useState<string>(order.status);
  const [saving, setSaving] = useState(false);

  const statusKeys: Record<string, string> = {
    pending: t('status.pending'),
    processing: t('status.processing'),
    shipped: t('status.shipped'),
    delivered: t('status.delivered'),
    completed: t('status.completed'),
    cancelled: t('status.cancelled'),
  };

  const paymentKeys: Record<string, string> = {
    pending: t('payment.pending'),
    paid: t('payment.paid'),
    failed: t('payment.failed'),
    refunded: t('payment.refunded'),
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setSaving(true);
    updateAdminOrderStatus(order._id, value as OrderStatus)
      .then(() => {
        toast.success(t('statusUpdated'));
        updateOrdersList();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || t('statusUpdateError'));
        setStatus(order.status);
      })
      .finally(() => setSaving(false));
  };

  const handleMarkPaid = () => {
    setSaving(true);
    markAdminOrderAsPaid(order._id)
      .then(() => {
        toast.success(t('markedPaid'));
        updateOrdersList();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || t('markPaidError'));
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className={'admin-card flex flex-col gap-2 p-4'}>
      <div className={'flex items-center justify-between flex-wrap gap-2'}>
        <div className={'flex flex-col'}>
          <div className={'font-semibold text-lg'}>{order.orderNumber}</div>
          <div className={'text-sm text-muted-foreground'}>{formatDate(order.createdAt)}</div>
        </div>

        <div className={'flex items-center gap-2 flex-wrap'}>
          <span className={`px-2 py-1 rounded-md text-xs ${paymentColors[order.paymentStatus] || 'bg-muted text-muted-foreground ring-1 ring-border'}`}>
            {paymentKeys[order.paymentStatus] || order.paymentStatus}
          </span>
          {order.isSandboxPayment && (
            <span className={'px-2 py-1 rounded-md text-[10px] uppercase bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 ring-1 ring-yellow-500/30'}>
              {t('sandboxBadge')}
            </span>
          )}
          <span className={`px-2 py-1 rounded-md text-xs ${statusColors[order.status] || 'bg-muted text-muted-foreground ring-1 ring-border'}`}>
            {statusKeys[order.status] || order.status}
          </span>
          <span className={'font-semibold'}>{order.total} ₴</span>
        </div>
      </div>

      <div className={'flex justify-between flex-wrap gap-2 text-sm'}>
        <div>
          <div>
            <span className={'text-muted-foreground'}>{t('customerLabel')} </span>
            {order.firstName} {order.lastName}
          </div>
          <div>
            <span className={'text-muted-foreground'}>{t('emailLabel')} </span>
            {order.email}
          </div>
          <div>
            <span className={'text-muted-foreground'}>{t('phoneLabel')} </span>
            {order.phoneNumber}
          </div>
        </div>
        <div>
          <div>
            <span className={'text-muted-foreground'}>{t('itemsLabel')} </span>
            {order.items.reduce((sum, i) => sum + i.quantity, 0)}
          </div>
          <div>
            <span className={'text-muted-foreground'}>{t('paymentLabel')} </span>
            {order.paymentMethod}
          </div>
          <div>
            <span className={'text-muted-foreground'}>{t('deliveryLabel')} </span>
            {order.deliveryType}
          </div>
        </div>
      </div>

      <div className={'flex gap-2 items-center flex-wrap mt-2'}>
        <Select value={status} onValueChange={handleStatusChange} disabled={saving}>
          <SelectTrigger className={'w-[180px]'}>
            <SelectValue placeholder={t('statusPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={'pending'}>{t('status.pending')}</SelectItem>
            <SelectItem value={'processing'}>{t('status.processing')}</SelectItem>
            <SelectItem value={'shipped'}>{t('status.shipped')}</SelectItem>
            <SelectItem value={'delivered'}>{t('status.delivered')}</SelectItem>
            <SelectItem value={'completed'}>{t('status.completed')}</SelectItem>
            <SelectItem value={'cancelled'}>{t('status.cancelled')}</SelectItem>
          </SelectContent>
        </Select>

        {order.paymentStatus !== 'paid' && (
          <Button variant={'outline'} disabled={saving} onClick={handleMarkPaid}>
            {t('markAsPaid')}
          </Button>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant={'outline'}>{t('viewDetails')}</Button>
          </DialogTrigger>
          <DialogContent className={'max-w-[700px] sm:max-w-[700px] max-h-screen overflow-y-auto'}>
            <DialogHeader>
              <DialogTitle>{t('orderNumber')} {order.orderNumber}</DialogTitle>
              <DialogDescription>{t('detailsDescription')}</DialogDescription>
            </DialogHeader>

            <div className={'flex flex-col gap-4 text-sm'}>
              <section>
                <div className={'font-semibold mb-1'}>{t('customer')}</div>
                <div>{order.firstName} {order.lastName}</div>
                <div>{order.email}</div>
                <div>{order.phoneNumber}</div>
              </section>

              {order.orderForAnotherPerson && (
                <section>
                  <div className={'font-semibold mb-1'}>{t('recipient')}</div>
                  <div>{order.anotherFirstName} {order.anotherLastName}</div>
                  <div>{order.anotherEmail}</div>
                  <div>{order.anotherPhoneNumber}</div>
                </section>
              )}

              <section>
                <div className={'font-semibold mb-1'}>{t('delivery')}</div>
                <div>{t('deliveryType')} {order.deliveryType}</div>
                <div>{t('deliveryCity')} {order.deliveryCity}</div>
                <div>{t('deliveryWarehouse')} {order.deliveryWarehouse}</div>
              </section>

              <section>
                <div className={'font-semibold mb-1'}>{t('itemsCount', { count: order.items.length })}</div>
                <div className={'flex flex-col gap-1'}>
                  {order.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className={'flex justify-between gap-2 border-b border-border pb-1'}>
                      <div>{item.name}</div>
                      <div className={'whitespace-nowrap'}>
                        {item.quantity} × {item.price} ₴
                        {item.oldPrice > item.price && (
                          <span className={'text-muted-foreground line-through ml-2'}>{item.oldPrice} ₴</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className={'font-semibold mb-1'}>{t('totals')}</div>
                <div className={'flex justify-between'}>
                  <span>{t('subtotal')}</span>
                  <span>{order.subtotal} ₴</span>
                </div>
                <div className={'flex justify-between'}>
                  <span>{t('discount')}</span>
                  <span>-{order.discount} ₴</span>
                </div>
                <div className={'flex justify-between'}>
                  <span>{t('freeDelivery')}</span>
                  <span>{order.hasFreeDelivery ? tCommon('yes') : tCommon('no')}</span>
                </div>
                <div className={'flex justify-between font-semibold'}>
                  <span>{tCommon('total')}</span>
                  <span>{order.total} ₴</span>
                </div>
              </section>

              {order.message && (
                <section>
                  <div className={'font-semibold mb-1'}>{t('message')}</div>
                  <div>{order.message}</div>
                </section>
              )}

              {(order.liqpayPaymentId || order.liqpayStatus || order.isSandboxPayment) && (
                <section>
                  <div className={'font-semibold mb-1'}>{t('liqpaySection')}</div>
                  {order.liqpayPaymentId && (
                    <div className={'flex justify-between gap-2'}>
                      <span className={'text-muted-foreground'}>{t('liqpayId')}</span>
                      <span className={'font-mono text-xs break-all'}>{order.liqpayPaymentId}</span>
                    </div>
                  )}
                  {order.liqpayTransactionId && (
                    <div className={'flex justify-between gap-2'}>
                      <span className={'text-muted-foreground'}>{t('liqpayTxId')}</span>
                      <span className={'font-mono text-xs break-all'}>{order.liqpayTransactionId}</span>
                    </div>
                  )}
                  {order.liqpayStatus && (
                    <div className={'flex justify-between gap-2'}>
                      <span className={'text-muted-foreground'}>{t('liqpayStatus')}</span>
                      <span>{order.liqpayStatus}</span>
                    </div>
                  )}
                  {order.isSandboxPayment && (
                    <div className={'flex justify-between gap-2'}>
                      <span className={'text-muted-foreground'}>{t('liqpayMode')}</span>
                      <span>{t('sandboxBadge')}</span>
                    </div>
                  )}
                </section>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
