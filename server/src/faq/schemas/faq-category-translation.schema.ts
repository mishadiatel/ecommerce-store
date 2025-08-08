import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FaqCategoryTranslationDocument = FaqCategoryTranslation & Document;

@Schema({ timestamps: true })
export class FaqCategoryTranslation {
  @Prop({ type: Types.ObjectId, ref: 'FaqCategory', required: true })
  faqCategoryId: Types.ObjectId;

  @Prop({ required: true })
  lang: string;

  @Prop()
  name?: string;
}

export const FaqCategoryTranslationSchema = SchemaFactory.createForClass(
  FaqCategoryTranslation,
);
FaqCategoryTranslationSchema.index(
  { faqCategoryId: 1, lang: 1 },
  { unique: true },
);
