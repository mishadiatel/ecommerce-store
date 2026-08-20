import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PopularQueryService } from './popular-query.service';
import { PopularQueryController } from './popular-query.controller';
import {
  PopularQuery,
  PopularQuerySchema,
} from './schemas/popular-query.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PopularQuery.name, schema: PopularQuerySchema },
    ]),
  ],
  controllers: [PopularQueryController],
  providers: [PopularQueryService],
  exports: [PopularQueryService],
})
export class PopularQueryModule {}
