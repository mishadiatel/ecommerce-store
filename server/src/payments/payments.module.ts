import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Order, OrderSchema } from '../order/schema/order.schema';
import { LiqPayService } from './liqpay/liqpay.service';
import { PaymentsController } from './payments.controller';
import { MailModule } from '../mail/mail.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MailModule,
    TelegramModule,
  ],
  controllers: [PaymentsController],
  providers: [LiqPayService],
  exports: [LiqPayService],
})
export class PaymentsModule {}
