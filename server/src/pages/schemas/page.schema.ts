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

  @Prop({ type: String, required: false })
  breadcrumbTitle: string;

  @Prop({ type: String, required: true, default: 'ua' })
  language: string;

  @Prop({ type: Boolean, required: true, default: false })
  index: boolean;

  @Prop({ type: Boolean, required: true, default: false })
  follow: boolean;
}

export const PageSchema = SchemaFactory.createForClass(Page);
PageSchema.index({ slug: 1, language: 1 }, { unique: true });
