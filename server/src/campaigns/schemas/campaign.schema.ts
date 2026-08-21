import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampaignDocument = Campaign & Document;

export enum CampaignStatus {
  DRAFT = 'draft',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ type: String, required: true })
  subject: string;

  @Prop({ type: String, required: true })
  html: string;

  @Prop({
    type: String,
    enum: Object.values(CampaignStatus),
    default: CampaignStatus.DRAFT,
    index: true,
  })
  status: CampaignStatus;

  /** Скільки листів було успішно доставлено Mailjet API. */
  @Prop({ type: Number, default: 0 })
  sentCount: number;

  /** Скільки листів впало з помилкою. */
  @Prop({ type: Number, default: 0 })
  failedCount: number;

  /** Кількість підписників на момент запуску розсилки. */
  @Prop({ type: Number, default: 0 })
  recipientsCount: number;

  @Prop({ type: Date, default: null })
  sentAt: Date | null;

  @Prop({ type: String, default: '' })
  lastError: string;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
CampaignSchema.index({ createdAt: -1 });
