import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Faq } from './faq.schema';

export type FaqTranslationDocument = FaqTranslation & Document;

@Schema({ timestamps: true })
export class FaqTranslation {
  @Prop({ type: Types.ObjectId, ref: Faq.name, required: true })
  faqId: Types.ObjectId;

  @Prop({ required: true })
  lang: string;

  @Prop({
    type: String,
    required: true,
  })
  question: string;

  @Prop({
    type: String,
    required: true,
  })
  answer: string;
}

export const FaqTranslationSchema =
  SchemaFactory.createForClass(FaqTranslation);
FaqTranslationSchema.index({ faqId: 1, lang: 1 }, { unique: true });
