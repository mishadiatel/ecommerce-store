import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as process from 'node:process';

export type GeneralSettingsTranslationDocument = GeneralSettingsTranslation &
  Document;

@Schema({ timestamps: true })
export class GeneralSettingsTranslation {
  @Prop({
    type: String,
    required: true,
    default: process.env.SITE_SETTINGS_ID,
  })
  generalID: string;

  @Prop({ type: String, required: true, default: 'ua' })
  language: string;

  @Prop({ type: String, required: true })
  schedule: string;
}

export const GeneralSettingsTranslationSchema = SchemaFactory.createForClass(
  GeneralSettingsTranslation,
);
GeneralSettingsTranslationSchema.index(
  { generalID: 1, language: 1 },
  { unique: true },
);