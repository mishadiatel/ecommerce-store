import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriberDocument = Subscriber & Document;

@Schema({ timestamps: true })
export class Subscriber {
  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  /**
   * Токен для one-click unsubscribe.
   * Використовується у footer'і кожного розсилального листа
   * як GET /api/subscribers/unsubscribe/:token
   */
  @Prop({ type: String, required: true, unique: true })
  unsubscribeToken: string;

  /** Звідки прийшла підписка (footer, popup, ...). */
  @Prop({ type: String, default: 'footer' })
  source: string;

  /** Мова сайту в момент підписки. */
  @Prop({ type: String, default: 'ua' })
  locale: string;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
SubscriberSchema.index({ email: 1 }, { unique: true });
SubscriberSchema.index({ unsubscribeToken: 1 }, { unique: true });
