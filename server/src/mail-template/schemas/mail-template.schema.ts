import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MailTemplateDocument = MailTemplate & Document;

@Schema({ timestamps: true })
export class MailTemplate {
  @Prop({ type: String, required: true })
  slug: string;

  @Prop({ type: String, required: true })
  subject: string;

  @Prop({ type: String, required: true })
  html: string;

  @Prop({ type: String, required: true, default: 'ua' })
  language: string;
}

export const MailTemplateSchema = SchemaFactory.createForClass(MailTemplate);
MailTemplateSchema.index({ slug: 1, language: 1 }, { unique: true });
