import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../../category/schema/category.schema';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true })
  cardImage: string;

  @Prop({ type: [String], required: true })
  images: string[];

  @Prop({ type: Number, required: true })
  newPrice: number;

  @Prop({ type: Number, required: false })
  oldPrice: number;

  @Prop({ type: Number, default: 0 })
  reviewsCount: number;

  @Prop({ type: Number, required: false })
  discountPercent: number;

  @Prop({ type: Boolean, default: false })
  isNew: boolean;

  @Prop({ type: Boolean, default: false })
  isLimited: boolean;

  @Prop({ type: Boolean, default: false })
  isOnSale: boolean;

  @Prop({ type: Boolean, default: false })
  isOnePlusOne: boolean;

  @Prop({ type: Boolean, default: true })
  isVisible: boolean;

  @Prop({ type: Number, default: 0 })
  order: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
