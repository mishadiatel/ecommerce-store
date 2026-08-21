import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  /** Мова відгуку — показуємо лише відгуки для поточної локалі сайту. */
  @Prop({ type: String, required: true, default: 'ua', index: true })
  language: string;

  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String, required: true })
  comment: string;

  /** Чи показувати відгук на сайті (модерація адміном). */
  @Prop({ type: Boolean, default: true, index: true })
  isVisible: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ productId: 1, language: 1, isVisible: 1, createdAt: -1 });
