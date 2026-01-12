import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from './category.schema';

export type CategoryTranslationDocument = CategoryTranslation & Document;

@Schema({
  timestamps: true,
})
export class CategoryTranslation {
  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: String, required: true, default: 'ua' })
  lang: string;

  @Prop({ type: String, required: true })
  name: string;
}

export const CategoryTranslationSchema =
  SchemaFactory.createForClass(CategoryTranslation);

CategoryTranslationSchema.index({ categoryId: 1, lang: 1 }, { unique: true });
