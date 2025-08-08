import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FaqCategoryDocument = FaqCategory & Document;

@Schema({ timestamps: true })
export class FaqCategory {
  @Prop({ default: true })
  visible: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const FaqCategorySchema = SchemaFactory.createForClass(FaqCategory);
