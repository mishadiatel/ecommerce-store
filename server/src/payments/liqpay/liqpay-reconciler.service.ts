import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../order/schema/order.schema';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../order/enum/order.enums';
import { LiqPayService } from './liqpay.service';
import {
  LiqPayCallbackPayload,
  LIQPAY_FINAL_FAIL,
  LIQPAY_FINAL_SUCCESS,
} from './liqpay.types';
import { MailService } from '../../mail/mail.service';
import { TelegramService } from '../../telegram/telegram.service';

/**
 * Спільна логіка застосування payload'а від LiqPay:
 *  - виставляє paymentStatus / status
 *  - шле telegram + email нотифікації
 *  - ідемпотентна: якщо замовлення вже оплачене — повторно не шле
 *
 * Використовується webhook-controller'ом, endpoint'ом статусу
 * та фоновим poller'ом.
 */
@Injectable()
export class LiqPayReconcilerService {
  private readonly logger = new Logger(LiqPayReconcilerService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly liqpay: LiqPayService,
    private readonly mailService: MailService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * @param source звідки прийшов payload:
   *   - `'webhook'` — довіряємо будь-яким статусам (LiqPay сам ініціював запит,
   *      підпис перевірено). Ставимо і PAID, і FAILED.
   *   - `'poll'`   — ми самі опитуємо LiqPay API. Тут `error/failure` часто
   *      означає лише "оплати ще нема" (замовлення тільки що створене,
   *      користувач ще не заплатив), тому FAILED НЕ виставляємо — лише SUCCESS.
   */
  async apply(
    order: OrderDocument,
    payload: LiqPayCallbackPayload,
    source: 'webhook' | 'poll' = 'webhook',
  ): Promise<void> {
    if (order.paymentStatus === PaymentStatus.PAID) {
      return;
    }

    const isFinalSuccess = LIQPAY_FINAL_SUCCESS.includes(payload.status);
    const isFinalFail = LIQPAY_FINAL_FAIL.includes(payload.status);

    // З polling'у застосовуємо ТІЛЬКИ фінальний success. Все інше
    // (fail/error/intermediate) — просто логуємо і не змінюємо статус,
    // щоб не позначити ще-неоплачене замовлення як FAILED.
    if (source === 'poll' && !isFinalSuccess) {
      this.logger.log(
        `Order ${order.orderNumber} poll status: ${payload.status} — no state change`,
      );
      return;
    }

    const previousStatus = order.liqpayStatus;

    order.liqpayPaymentId = String(payload.payment_id ?? '');
    order.liqpayTransactionId = String(payload.transaction_id ?? '');
    order.liqpayStatus = payload.status;
    order.isSandboxPayment =
      payload.status === 'sandbox' || payload.sandbox === 1;

    if (isFinalSuccess) {
      order.paymentStatus = PaymentStatus.PAID;
      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.PROCESSING;
      }

      this.logger.log(
        `Order ${order.orderNumber} PAID (${payload.status}, amount=${payload.amount} ${payload.currency})`,
      );

      void this.telegramService
        .sendMessage({
          text:
            `✅ <b>Замовлення оплачено</b>\n` +
            `<b>№:</b> ${order.orderNumber}\n` +
            `<b>Сума:</b> ${payload.amount ?? order.total} ${payload.currency ?? 'UAH'}\n` +
            `<b>LiqPay:</b> ${payload.status}` +
            (order.isSandboxPayment ? ' (sandbox)' : ''),
        })
        .catch((err: unknown) => {
          this.logger.warn(
            `Failed to send paid telegram: ${(err as Error).message}`,
          );
        });

      if (order.email && previousStatus !== payload.status) {
        void this.mailService
          .sendOrderPaidEmail({
            email: order.email,
            orderNumber: order.orderNumber,
            firstName: order.firstName,
          })
          .catch((err: unknown) => {
            this.logger.warn(
              `Failed to send paid email: ${(err as Error).message}`,
            );
          });
      }
    } else if (isFinalFail) {
      order.paymentStatus = PaymentStatus.FAILED;
      this.logger.warn(
        `Order ${order.orderNumber} payment FAILED: ${payload.status} ${payload.err_code ?? ''} ${payload.err_description ?? ''}`,
      );
    } else {
      this.logger.log(
        `Order ${order.orderNumber} intermediate status: ${payload.status}`,
      );
    }

    await order.save();
  }

  /**
   * Фоновий метод: беремо всі pending online-замовлення старіші за N секунд
   * і активно питаємо у LiqPay їх статус.
   * Викликається cron-задачею.
   */
  async reconcilePending(olderThanSeconds: number = 30, maxAgeHours: number = 24) {
    const now = Date.now();
    const cutoffNew = new Date(now - olderThanSeconds * 1000);
    const cutoffOld = new Date(now - maxAgeHours * 60 * 60 * 1000);

    const pending = await this.orderModel
      .find({
        paymentMethod: PaymentMethod.ONLINE,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: { $gte: cutoffOld, $lte: cutoffNew },
      })
      .limit(50);

    if (pending.length === 0) return;

    this.logger.log(
      `LiqPay reconciler: polling status for ${pending.length} pending order(s)`,
    );

    for (const order of pending) {
      try {
        const remote = await this.liqpay.queryRemoteStatus(order.orderNumber);
        if (remote && remote.status) {
          await this.apply(order, remote, 'poll');
        }
      } catch (err) {
        this.logger.warn(
          `Reconciler failed for ${order.orderNumber}: ${(err as Error).message}`,
        );
      }
    }
  }
}
