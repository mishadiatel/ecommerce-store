'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useModalStore, OrderDetailsPayload } from '@/stores/useModalStore';
import { MyOrder, getMyOrder } from '@/services/order';
import Loader from '@/components/ui/loader/Loader';
import axios from 'axios';

interface OrderDetailsModalProps {
  open: boolean;
}

function formatDate(value?: string) {
  if (!value) return '';
  try {
    const d = new Date(value);
    return d.toLocaleString();
  } catch {
    return value;
  }
}

const KNOWN_STATUSES = new Set([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
]);
const KNOWN_PAYMENT_STATUSES = new Set(['pending', 'paid', 'failed']);
const KNOWN_PAYMENT_METHODS = new Set(['online', 'cash_on_delivery']);

export default function OrderDetailsModal({ open }: OrderDetailsModalProps) {
  const t = useTranslations();
  const closeModal = useModalStore(s => s.closeModal);
  const payload = useModalStore(s => s.modal?.payload) as
    | OrderDetailsPayload
    | undefined;
  const [order, setOrder] = useState<MyOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !payload?.orderId) {
      setOrder(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getMyOrder(payload.orderId)
      .then(data => {
        if (cancelled) return;
        setOrder(data);
      })
      .catch(err => {
        if (cancelled) return;
        let message = t('Account.orders.loadDetailsError');
        if (axios.isAxiosError(err)) {
          const data = err.response?.data as
            | { message?: string | string[] }
            | undefined;
          const msg = data?.message;
          if (Array.isArray(msg)) message = msg.join(', ');
          else if (typeof msg === 'string') message = msg;
        }
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, payload?.orderId, t]);

  if (!open) return null;

  return (
    <div className="modal-cart-block">
      <div className="modal-cart-overlay" onClick={closeModal}></div>
      <div className={`modal-cart-main flex ${open ? 'open' : ''}`}>
        <div className="cart-block flex flex-col w-full p-5 sm:p-8 relative overflow-y-auto">
          <div className="heading mb-6 flex items-center justify-between relative">
            <div className="font-semibold sm:font-bold text-black text-[22px] sm:text-[28px] lg:text-[32px]">
              {order
                ? t('Account.orders.detailsTitleWithNumber', {
                    number: order.orderNumber,
                  })
                : t('Account.orders.detailsTitle')}
            </div>
            <button
              type="button"
              className="close-btn button-main icon-button middle bg-gray absolute top-0 right-0"
              onClick={closeModal}
              aria-label="close"
            >
              <i className="icon icon-x"></i>
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader />
            </div>
          )}

          {error && !isLoading && (
            <div className="text-red-700 text-base py-6 text-center">
              {error}
            </div>
          )}

          {!isLoading && order && (
            <div className="flex flex-col gap-6">
              {/* Status row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-extra-light-gray rounded-2xl p-4 sm:p-5">
                <div>
                  <div className="text-xs uppercase text-gray-90">
                    {t('Account.orders.fields.status')}
                  </div>
                  <div className="font-semibold mt-1">
                    {KNOWN_STATUSES.has(order.status)
                      ? t(`Account.orders.statuses.${order.status}`)
                      : order.status}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-90">
                    {t('Account.orders.fields.paymentStatus')}
                  </div>
                  <div className="font-semibold mt-1">
                    {KNOWN_PAYMENT_STATUSES.has(order.paymentStatus)
                      ? t(
                          `Account.orders.paymentStatuses.${order.paymentStatus}`,
                        )
                      : order.paymentStatus}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-90">
                    {t('Account.orders.fields.paymentMethod')}
                  </div>
                  <div className="font-semibold mt-1">
                    {KNOWN_PAYMENT_METHODS.has(order.paymentMethod)
                      ? t(
                          `Account.orders.paymentMethods.${order.paymentMethod}`,
                        )
                      : order.paymentMethod}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-90">
                    {t('Account.orders.fields.createdAt')}
                  </div>
                  <div className="font-semibold mt-1">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="heading-6 mb-3">
                  {t('Account.orders.fields.items')}
                </div>
                <div className="flex flex-col divide-y divide-gray-20 border border-gray-20 rounded-2xl overflow-hidden">
                  {order.items.map((item, idx) => (
                    <div
                      key={`${item.productId}-${idx}`}
                      className="flex items-start gap-3 p-3 sm:p-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium break-words">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-90 mt-1">
                          {t('Account.orders.fields.quantity')}:{' '}
                          {item.quantity}
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <div className="font-semibold">
                          {item.price * item.quantity} {t('Product.currencyUah')}
                        </div>
                        {item.oldPrice > item.price && (
                          <div className="text-xs text-gray-90 line-through">
                            {item.oldPrice * item.quantity}{' '}
                            {t('Product.currencyUah')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-extra-light-gray rounded-2xl p-4 sm:p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-90">
                    {t('Account.orders.fields.subtotal')}
                  </span>
                  <span>
                    {order.subtotal} {t('Product.currencyUah')}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-90">
                      {t('Account.orders.fields.discount')}
                    </span>
                    <span>
                      -{order.discount} {t('Product.currencyUah')}
                    </span>
                  </div>
                )}
                {order.promoCode && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-90">
                      {t('Account.orders.fields.promoCode')}
                    </span>
                    <span className="font-mono uppercase">
                      {order.promoCode}
                      {order.promoCodeDiscountAmount
                        ? ` (-${order.promoCodeDiscountAmount} ${t('Product.currencyUah')})`
                        : ''}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-20">
                  <span className="font-semibold">
                    {t('Account.orders.fields.total')}
                  </span>
                  <span className="font-semibold text-lg">
                    {order.total} {t('Product.currencyUah')}
                  </span>
                </div>
              </div>

              {/* Delivery */}
              {(order.deliveryType ||
                order.deliveryCity ||
                order.deliveryWarehouse) && (
                <div>
                  <div className="heading-6 mb-3">
                    {t('Account.orders.fields.delivery')}
                  </div>
                  <div className="border border-gray-20 rounded-2xl p-4 flex flex-col gap-1 text-sm">
                    {order.deliveryType && (
                      <div>
                        <span className="text-gray-90">
                          {t('Account.orders.fields.deliveryType')}:{' '}
                        </span>
                        <span>{order.deliveryType}</span>
                      </div>
                    )}
                    {order.deliveryCity && (
                      <div>
                        <span className="text-gray-90">
                          {t('Account.orders.fields.deliveryCity')}:{' '}
                        </span>
                        <span>{order.deliveryCity}</span>
                      </div>
                    )}
                    {order.deliveryWarehouse && (
                      <div>
                        <span className="text-gray-90">
                          {t('Account.orders.fields.deliveryWarehouse')}:{' '}
                        </span>
                        <span>{order.deliveryWarehouse}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact */}
              {(order.email ||
                order.firstName ||
                order.lastName ||
                order.phoneNumber) && (
                <div>
                  <div className="heading-6 mb-3">
                    {t('Account.orders.fields.contact')}
                  </div>
                  <div className="border border-gray-20 rounded-2xl p-4 flex flex-col gap-1 text-sm">
                    {(order.firstName || order.lastName) && (
                      <div>
                        {order.firstName} {order.lastName}
                      </div>
                    )}
                    {order.email && <div>{order.email}</div>}
                    {order.phoneNumber && <div>{order.phoneNumber}</div>}
                  </div>
                </div>
              )}

              {/* Recipient (if different) */}
              {order.orderForAnotherPerson && (
                <div>
                  <div className="heading-6 mb-3">
                    {t('Account.orders.fields.recipient')}
                  </div>
                  <div className="border border-gray-20 rounded-2xl p-4 flex flex-col gap-1 text-sm">
                    {(order.anotherFirstName || order.anotherLastName) && (
                      <div>
                        {order.anotherFirstName} {order.anotherLastName}
                      </div>
                    )}
                    {order.anotherEmail && <div>{order.anotherEmail}</div>}
                    {order.anotherPhoneNumber && (
                      <div>{order.anotherPhoneNumber}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Comment */}
              {order.message && (
                <div>
                  <div className="heading-6 mb-3">
                    {t('Account.orders.fields.message')}
                  </div>
                  <div className="border border-gray-20 rounded-2xl p-4 text-sm whitespace-pre-wrap">
                    {order.message}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="footer-modal bg-white w-full mt-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={closeModal}
                className="button-main w-full uppercase mx-auto"
              >
                {t('Account.orders.closeButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
