import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from './product.schema';

export type ProductTranslationDocument = ProductTranslation & Document;

@Schema({
  timestamps: true,
})
export class ProductTranslation {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  productId: Types.ObjectId;

  @Prop({ type: String, required: true, default: 'ua' })
  lang: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: false })
  shortDescription: string;

  @Prop({ type: String, required: false })
  longDescription: string;

  @Prop({ type: String, required: false })
  composition: string;

  @Prop({ type: String, required: false })
  expiration: string;

  @Prop({ type: String, required: false })
  nutritionalTable: string;
}

export const ProductTranslationSchema =
  SchemaFactory.createForClass(ProductTranslation);

ProductTranslationSchema.index({ productId: 1, lang: 1 }, { unique: true });
