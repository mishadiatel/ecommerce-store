import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FaqDocument = Faq & Document;

@Schema({ timestamps: true })
export class Faq {
  @Prop({ type: Types.ObjectId, ref: 'FaqCategory', required: false })
  faqCategoryId?: Types.ObjectId;

  @Prop({ default: true })
  visible: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
