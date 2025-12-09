import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PageDocument = Page & Document;

@Schema({ timestamps: true })
export class Page {
  @Prop({ type: String, required: true })
  slug: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  robots: string;

  @Prop({ type: String, required: true, default: 'ua' })
  language: string;
}

export const PageSchema = SchemaFactory.createForClass(Page);
