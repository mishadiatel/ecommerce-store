import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Faq, FaqSchema } from './schemas/faq.schema';
import {
  FaqTranslation,
  FaqTranslationSchema,
} from './schemas/faq-translation.schema';
import { FaqCategory, FaqCategorySchema } from './schemas/faq-category.schema';
import {
  FaqCategoryTranslation,
  FaqCategoryTranslationSchema,
} from './schemas/faq-category-translation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Faq.name, schema: FaqSchema },
      { name: FaqTranslation.name, schema: FaqTranslationSchema },
      { name: FaqCategory.name, schema: FaqCategorySchema },
      {
        name: FaqCategoryTranslation.name,
        schema: FaqCategoryTranslationSchema,
      },
    ]),
  ],
  providers: [FaqService],
  controllers: [FaqController],
})
export class FaqModule {}
