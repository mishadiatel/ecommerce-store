import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ default: true })
  visible: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
