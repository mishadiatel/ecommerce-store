import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from './schemas/banner.schema';
import {
  BannerTranslation,
  BannerTranslationSchema,
} from './schemas/banner-translation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Banner.name, schema: BannerSchema },
      { name: BannerTranslation.name, schema: BannerTranslationSchema },
    ]),
  ],
  providers: [BannerService],
  controllers: [BannerController],
})
export class BannerModule {}
