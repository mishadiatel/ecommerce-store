import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order, OrderSchema } from './schema/order.schema';
import { CartModule } from '../cart/cart.module';
import { TelegramModule } from '../telegram/telegram.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CartModule,
    TelegramModule,
    MailModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
