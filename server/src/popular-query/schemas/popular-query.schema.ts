import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PopularQueryDocument = PopularQuery & Document;

@Schema({ timestamps: true })
export class PopularQuery {
  @Prop({ type: String, required: true })
  queryText: string;

  @Prop({ type: String, required: true, default: 'ua' })
  language: string;

  @Prop({ type: Boolean, required: true, default: true })
  visible: boolean;
}

export const PopularQuerySchema = SchemaFactory.createForClass(PopularQuery);
PopularQuerySchema.index({ queryText: 1, language: 1 }, { unique: true });
PopularQuerySchema.index({ language: 1, visible: 1 });
