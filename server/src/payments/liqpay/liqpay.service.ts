import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import axios from 'axios';
import { OrderDocument } from '../../order/schema/order.schema';
import {
  LiqPayCallbackPayload,
  LiqPayCheckoutParams,
} from './liqpay.types';

@Injectable()
export class LiqPayService {
  private readonly logger = new Logger(LiqPayService.name);
  private readonly checkoutUrl = 'https://www.liqpay.ua/api/3/checkout';

  constructor(private readonly config: ConfigService) {}

  private get publicKey(): string {
    return this.config.getOrThrow<string>('LIQPAY_PUBLIC_KEY');
  }

  private get privateKey(): string {
    return this.config.getOrThrow<string>('LIQPAY_PRIVATE_KEY');
  }

  private get sandbox(): boolean {
    return this.config.get<string>('LIQPAY_SANDBOX') === '1';
  }

  /** LiqPay signature: base64(sha1(private + data + private)) */
  sign(data: string): string {
    return createHash('sha1')
      .update(this.privateKey + data + this.privateKey)
      .digest('base64');
  }

  verify(data: string, signature: string): boolean {
    return this.sign(data) === signature;
  }

  buildCheckoutParams(order: OrderDocument): LiqPayCheckoutParams {
    const appUrl = this.config.getOrThrow<string>('APP_PUBLIC_URL');
    const apiUrl = this.config.getOrThrow<string>('API_PUBLIC_URL');

    const payload = {
      public_key: this.publicKey,
      version: '3',
      action: 'pay',
      amount: Number(order.total.toFixed(2)),
      currency: 'UAH',
      description: `Замовлення #${order.orderNumber}`,
      order_id: order.orderNumber,
      result_url: `${appUrl}/checkout/result?orderId=${order.orderNumber}`,
      server_url: `${apiUrl}/api/payments/liqpay/callback`,
      sandbox: this.sandbox ? 1 : 0,
      language: 'uk',
    };

    const data = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = this.sign(data);

    this.logger.log(
      `LiqPay checkout prepared for order ${order.orderNumber}, sandbox=${this.sandbox}`,
    );

    return { data, signature, checkoutUrl: this.checkoutUrl };
  }

  parseCallback(rawData: string): LiqPayCallbackPayload {
    const json = Buffer.from(rawData, 'base64').toString('utf8');
    return JSON.parse(json) as LiqPayCallbackPayload;
  }

  /**
   * Actively pull payment status from LiqPay API.
   * Used as a fallback when our public webhook endpoint isn't reachable
   * (local dev on LAN without ngrok). POSTs to the LiqPay request endpoint
   * with action=status and returns the same payload shape as a webhook.
   */
  async queryRemoteStatus(
    orderNumber: string,
  ): Promise<LiqPayCallbackPayload | null> {
    const payload = {
      public_key: this.publicKey,
      version: '3',
      action: 'status',
      order_id: orderNumber,
    };

    const data = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = this.sign(data);

    try {
      const body = new URLSearchParams();
      body.append('data', data);
      body.append('signature', signature);

      const response = await axios.post<LiqPayCallbackPayload>(
        'https://www.liqpay.ua/api/request',
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        },
      );

      return response.data;
    } catch (err) {
      this.logger.warn(
        `LiqPay status query failed for ${orderNumber}: ${(err as Error).message}`,
      );
      return null;
    }
  }
}
