import { useState } from 'react';
import { toast } from 'react-toastify';
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
  const [status, setStatus] = useState<string>(order.status);
  const [saving, setSaving] = useState(false);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setSaving(true);
    updateAdminOrderStatus(order._id, value as OrderStatus)
      .then(() => {
        toast.success('Order status updated');
        updateOrdersList();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Error updating status');
        setStatus(order.status);
      })
      .finally(() => setSaving(false));
  };

  const handleMarkPaid = () => {
    setSaving(true);
    markAdminOrderAsPaid(order._id)
      .then(() => {
        toast.success('Order marked as paid');
        updateOrdersList();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Error marking paid');
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
            {order.paymentStatus}
          </span>
          <span className={`px-2 py-1 rounded-md text-xs ${statusColors[order.status] || 'bg-muted text-muted-foreground ring-1 ring-border'}`}>
            {order.status}
          </span>
          <span className={'font-semibold'}>{order.total} ₴</span>
        </div>
      </div>

      <div className={'flex justify-between flex-wrap gap-2 text-sm'}>
        <div>
          <div>
            <span className={'text-muted-foreground'}>Customer: </span>
            {order.firstName} {order.lastName}
          </div>
          <div>
            <span className={'text-muted-foreground'}>Email: </span>
            {order.email}
          </div>
          <div>
            <span className={'text-muted-foreground'}>Phone: </span>
            {order.phoneNumber}
          </div>
        </div>
        <div>
          <div>
            <span className={'text-muted-foreground'}>Items: </span>
            {order.items.reduce((sum, i) => sum + i.quantity, 0)}
          </div>
          <div>
            <span className={'text-muted-foreground'}>Payment: </span>
            {order.paymentMethod}
          </div>
          <div>
            <span className={'text-muted-foreground'}>Delivery: </span>
            {order.deliveryType}
          </div>
        </div>
      </div>

      <div className={'flex gap-2 items-center flex-wrap mt-2'}>
        <Select value={status} onValueChange={handleStatusChange} disabled={saving}>
          <SelectTrigger className={'w-[180px]'}>
            <SelectValue placeholder={'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={'pending'}>Pending</SelectItem>
            <SelectItem value={'processing'}>Processing</SelectItem>
            <SelectItem value={'shipped'}>Shipped</SelectItem>
            <SelectItem value={'delivered'}>Delivered</SelectItem>
            <SelectItem value={'completed'}>Completed</SelectItem>
            <SelectItem value={'cancelled'}>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {order.paymentStatus !== 'paid' && (
          <Button variant={'outline'} disabled={saving} onClick={handleMarkPaid}>
            Mark as paid
          </Button>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant={'outline'}>Details</Button>
          </DialogTrigger>
          <DialogContent className={'max-w-[700px] sm:max-w-[700px] max-h-screen overflow-y-auto'}>
            <DialogHeader>
              <DialogTitle>Order {order.orderNumber}</DialogTitle>
              <DialogDescription>Details of the order</DialogDescription>
            </DialogHeader>

            <div className={'flex flex-col gap-4 text-sm'}>
              <section>
                <div className={'font-semibold mb-1'}>Customer</div>
                <div>{order.firstName} {order.lastName}</div>
                <div>{order.email}</div>
                <div>{order.phoneNumber}</div>
              </section>

              {order.orderForAnotherPerson && (
                <section>
                  <div className={'font-semibold mb-1'}>Recipient</div>
                  <div>{order.anotherFirstName} {order.anotherLastName}</div>
                  <div>{order.anotherEmail}</div>
                  <div>{order.anotherPhoneNumber}</div>
                </section>
              )}

              <section>
                <div className={'font-semibold mb-1'}>Delivery</div>
                <div>Type: {order.deliveryType}</div>
                <div>City: {order.deliveryCity}</div>
                <div>Warehouse: {order.deliveryWarehouse}</div>
              </section>

              <section>
                <div className={'font-semibold mb-1'}>Items ({order.items.length})</div>
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
                <div className={'font-semibold mb-1'}>Totals</div>
                <div className={'flex justify-between'}>
                  <span>Subtotal</span>
                  <span>{order.subtotal} ₴</span>
                </div>
                <div className={'flex justify-between'}>
                  <span>Discount</span>
                  <span>-{order.discount} ₴</span>
                </div>
                <div className={'flex justify-between'}>
                  <span>Free delivery</span>
                  <span>{order.hasFreeDelivery ? 'Yes' : 'No'}</span>
                </div>
                <div className={'flex justify-between font-semibold'}>
                  <span>Total</span>
                  <span>{order.total} ₴</span>
                </div>
              </section>

              {order.message && (
                <section>
                  <div className={'font-semibold mb-1'}>Message</div>
                  <div>{order.message}</div>
                </section>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
