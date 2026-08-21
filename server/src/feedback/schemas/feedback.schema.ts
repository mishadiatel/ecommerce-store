import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FeedbackType } from '../enum/feedback.enums';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({
    type: String,
    enum: Object.values(FeedbackType),
    required: true,
    index: true,
  })
  type: FeedbackType;

  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, default: '' })
  message: string;

  @Prop({ type: Boolean, default: false })
  isAgree: boolean;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
FeedbackSchema.index({ createdAt: -1 });
