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
  PaymentMethod,
  PaymentStatus,
} from '../order/enum/order.enums';
import { LiqPayService } from './liqpay/liqpay.service';
import { LiqPayReconcilerService } from './liqpay/liqpay-reconciler.service';

@ApiTags('Payments')
@Controller('payments/liqpay')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly liqpay: LiqPayService,
    private readonly reconciler: LiqPayReconcilerService,
  ) {}

  /** Client calls this to re-obtain LiqPay redirect params for a pending order */
  @Post('init')
  @ApiOperation({
    summary: 'Ініціалізувати LiqPay-платіж для замовлення',
    description:
      'Повторно повертає параметри редіректу LiqPay (data + signature) для замовлення, яке ще не оплачено.',
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
      'Ендпоінт для серверних callback-запитів від LiqPay. Приймає application/x-www-form-urlencoded з `data` (base64 JSON) та `signature`. Ідемпотентний. Потребує щоб `API_PUBLIC_URL` був доступний з інтернету — інакше LiqPay callback не досягне сервера і треба покладатись на background poller.',
  })
  @ApiResponse({ status: 200, description: 'Callback оброблено' })
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

    await this.reconciler.apply(order, payload);
    return { ok: true };
  }

  @Get('status/:orderNumber')
  @ApiOperation({
    summary: 'Отримати актуальний статус оплати замовлення',
    description:
      'Опитується сторінкою /checkout/result. Якщо замовлення досі PENDING — активно робить запит до LiqPay API і застосовує результат.',
  })
  @ApiParam({
    name: 'orderNumber',
    description: 'Номер замовлення',
    example: 'ORD-20260812-0001',
  })
  @ApiResponse({ status: 200, description: 'Поточний статус оплати' })
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
        // 'poll' — не позначаємо як FAILED тільки з polling'у,
        // щоб не збити стан ще-неоплаченого замовлення
        await this.reconciler.apply(order, remote, 'poll');
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
}
