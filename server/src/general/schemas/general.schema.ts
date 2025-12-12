import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as process from 'node:process';

export type GeneralSettingsDocument = GeneralSettings & Document;

@Schema({ timestamps: true })
export class GeneralSettings {
  @Prop({
    type: String,
    required: true,
    default: process.env.SITE_SETTINGS_ID,
    unique: true,
  })
  generalID: string;

  @Prop({ type: String, required: true })
  companyName: string;

  @Prop({ type: String, required: true })
  logo: string;

  @Prop({ type: String, required: true })
  favicon: string;

  @Prop({ type: String, required: false })
  instagram: string;

  @Prop({ type: String, required: false })
  facebook: string;

  @Prop({ type: String, required: false })
  tiktok: string;

  @Prop({ type: String, required: false })
  telegram: string;

  @Prop({ type: String, required: false })
  phoneNumber: string;
}

export const GeneralSettingsSchema =
  SchemaFactory.createForClass(GeneralSettings);
