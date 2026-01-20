import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BlockDocument = Block & Document;

@Schema({ timestamps: true })
export class Block {
  @Prop({ type: [String], required: true })
  pages: string[];

  @Prop({ type: [String], required: true })
  languages: string[];

  @Prop({ type: Number, required: true })
  order: number;

  @Prop({ type: String, required: true })
  blockType: string;

  @Prop({ type: Boolean, default: true })
  visible: boolean;

  @Prop({ type: Boolean, default: false })
  isTop: boolean;

  @Prop({ type: Boolean, default: false })
  isBottom: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  blockData: Record<string, any>;
}

export const BlockSchema = SchemaFactory.createForClass(Block);
