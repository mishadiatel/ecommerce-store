import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Banner } from './banner.schema';

export type BannerTranslationDocument = BannerTranslation & Document;

@Schema({ timestamps: true })
export class BannerTranslation {
  @Prop({ type: Types.ObjectId, ref: Banner.name, required: true })
  bannerId: Types.ObjectId;

  @Prop({ required: true })
  lang: string;

  @Prop()
  title?: string;

  @Prop()
  text?: string;

  @Prop()
  buttonText?: string;

  @Prop()
  buttonLink?: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  backgroundColor?: string;
}

export const BannerTranslationSchema =
  SchemaFactory.createForClass(BannerTranslation);

BannerTranslationSchema.index({ bannerId: 1, lang: 1 }, { unique: true });