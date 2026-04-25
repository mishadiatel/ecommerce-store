import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoCodeService } from './promo-code.service';
import { PromoCodeController } from './promo-code.controller';
import { PromoCode, PromoCodeSchema } from './schema/promo-code.schema';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromoCode.name, schema: PromoCodeSchema },
    ]),
    CartModule,
  ],
  controllers: [PromoCodeController],
  providers: [PromoCodeService],
  exports: [PromoCodeService],
})
export class PromoCodeModule {}
