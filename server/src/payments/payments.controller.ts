import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../order/schema/order.schema';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../order/enum/order.enums';
import { LiqPayService } from './liqpay/liqpay.service';
import {
  LiqPayCallbackPayload,
  LIQPAY_FINAL_FAIL,
  LIQPAY_FINAL_SUCCESS,
} from './liqpay/liqpay.types';
import { MailService } from '../mail/mail.service';
import { TelegramService } from '../telegram/telegram.service';

@ApiTags('Payments')
@Controller('payments/liqpay')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly liqpay: LiqPayService,
    private readonly mailService: MailService,
    private readonly telegramService: TelegramService,
  ) {}

  /** Client calls this to re-obtain LiqPay redirect params for a pending order */
  @Post('init')
  @ApiOperation({
    summary: 'Ініціалізувати LiqPay-платіж для замовлення',
    description:
      'Повторно повертає параметри редіректу LiqPay (data + signature) для замовлення, яке ще не оплачено. Використовується сторінкою чекауту для запуску форми оплати LiqPay.',
  })
  @ApiResponse({ status: 201, description: 'Параметри LiqPay успішно згенеровано' })
  @ApiResponse({
    status: 400,
    description: 'Відсутній orderNumber, замовлення не онлайн-типу або вже оплачене',
  })
  @ApiResponse({ status: 404, description: 'Замовлення не знайдено' })
  async init(@Body('orderNumber') orderNumber: string) {
    if (!orderNumber) {
      throw new BadRequestException('orderNumber required');
    }

    const order = await this.orderModel.findOne({ orderNumber });
    if (!order) throw new NotFoundException('Order not found');

    if (order.paymentMethod !== PaymentMethod.ONLINE) {
      throw new BadRequestException('Order is not online-paid');
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    return this.liqpay.buildCheckoutParams(order);
  }

  /** LiqPay server-to-server webhook. Signature-verified, idempotent. */
  @Post('callback')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Вебхук LiqPay (server-to-server)',
    description:
      'Ендпоінт для серверних callback-запитів від LiqPay. Приймає тіло у форматі application/x-www-form-urlencoded з полями `data` (base64 JSON payload) та `signature`. Підпис перевіряється, обробка ідемпотентна: повторні виклики для вже оплачених замовлень не змінюють стан. Не викликається клієнтом.',
  })
  @ApiResponse({
    status: 200,
    description: 'Callback оброблено. Повертає { ok: true } або { ok: false } — LiqPay завжди отримує HTTP 200',
  })
  async callback(
    @Body('data') data: string,
    @Body('signature') signature: string,
  ) {
    if (!data || !signature) {
      this.logger.warn('LiqPay callback missing data/signature');
      return { ok: false };
    }

    if (!this.liqpay.verify(data, signature)) {
      this.logger.warn('LiqPay callback signature mismatch — possible attack');
      return { ok: false };
    }

    const payload = this.liqpay.parseCallback(data);
    const order = await this.orderModel.findOne({
      orderNumber: payload.order_id,
    });
    if (!order) {
      this.logger.warn(
        `LiqPay callback for unknown order ${payload.order_id}`,
      );
      return { ok: false };
    }

    await this.applyLiqPayPayload(order, payload);
    return { ok: true };
  }

  /**
   * Polled by storefront /checkout/result page. If the order is still pending
   * locally, we actively query LiqPay's status API and apply the result —
   * this makes the flow work on LAN/localhost where LiqPay can't reach our
   * webhook endpoint.
   */
  @Get('status/:orderNumber')
  @ApiOperation({
    summary: 'Отримати актуальний статус оплати замовлення',
    description:
      'Опитується сторінкою /checkout/result. Якщо замовлення досі в статусі PENDING — активно робить запит до status API LiqPay і застосовує результат. Це дозволяє працювати flow оплати в локальному середовищі, де LiqPay не може достукатись до нашого webhook.',
  })
  @ApiParam({
    name: 'orderNumber',
    description: 'Номер замовлення',
    example: 'ORD-20260812-0001',
  })
  @ApiResponse({ status: 200, description: 'Поточний статус оплати повернуто' })
  @ApiResponse({ status: 404, description: 'Замовлення не знайдено' })
  async status(@Param('orderNumber') orderNumber: string) {
    const order = await this.orderModel.findOne({ orderNumber });
    if (!order) throw new NotFoundException('Order not found');

    if (
      order.paymentMethod === PaymentMethod.ONLINE &&
      order.paymentStatus === PaymentStatus.PENDING
    ) {
      const remote = await this.liqpay.queryRemoteStatus(orderNumber);
      if (remote && remote.status) {
        await this.applyLiqPayPayload(order, remote);
      }
    }

    return {
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      liqpayStatus: order.liqpayStatus ?? null,
      isSandboxPayment: order.isSandboxPayment ?? false,
    };
  }

  /** Shared between webhook and active-poll paths. Idempotent. */
  private async applyLiqPayPayload(
    order: OrderDocument,
    payload: LiqPayCallbackPayload,
  ): Promise<void> {
    // idempotent: already paid → just refresh mirrored fields and return
    if (order.paymentStatus === PaymentStatus.PAID) {
      return;
    }

    const previousStatus = order.liqpayStatus;

    order.liqpayPaymentId = String(payload.payment_id ?? '');
    order.liqpayTransactionId = String(payload.transaction_id ?? '');
    order.liqpayStatus = payload.status;
    order.isSandboxPayment =
      payload.status === 'sandbox' || payload.sandbox === 1;

    if (LIQPAY_FINAL_SUCCESS.includes(payload.status)) {
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
    } else if (LIQPAY_FINAL_FAIL.includes(payload.status)) {
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
}
