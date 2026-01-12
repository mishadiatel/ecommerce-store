import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true,
})
export class Category {
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true })
  image: string;

  @Prop({ type: String, required: true })
  backgroundColor: string;

  @Prop({ type: Boolean, default: true })
  isVisible: boolean;

  @Prop({ type: Number, default: 0 })
  order: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
