import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CategoryTranslation,
  CategoryTranslationSchema,
} from './schema/category-translation.schema';
import { Category, CategorySchema } from './schema/category.schema';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      {
        name: CategoryTranslation.name,
        schema: CategoryTranslationSchema,
      },
    ]),
    ProductModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
