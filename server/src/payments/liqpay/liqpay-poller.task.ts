import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LiqPayReconcilerService } from './liqpay-reconciler.service';

/**
 * Cron-задача: кожну хвилину запитує у LiqPay статус усіх pending
 * online-замовлень. Не залежить від webhook — рятує коли server_url
 * недосяжний з інтернету (LAN, dev без ngrok).
 */
@Injectable()
export class LiqPayPollerTask {
  private readonly logger = new Logger(LiqPayPollerTask.name);

  constructor(private readonly reconciler: LiqPayReconcilerService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      await this.reconciler.reconcilePending(30, 24);
    } catch (err) {
      this.logger.error(
        `LiqPay poller crashed: ${(err as Error).message}`,
      );
    }
  }
}
