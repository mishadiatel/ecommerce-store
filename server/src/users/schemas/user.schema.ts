import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ type: String, required: false })
  firstName: string;

  @Prop({ type: String, required: false })
  lastName: string;

  @Prop({ type: String, required: false })
  phoneNumber: string;

  @Prop({ type: Date, required: false })
  birthDay: Date;

  @Prop({ type: Boolean, required: true, default: false })
  isActivated: boolean;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: 'user' | 'admin';

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({ type: String, select: false })
  refreshToken?: string;

  @Prop({ type: Date, required: false, select: false })
  passwordChangedAt?: Date;

  @Prop({ type: String, required: false, select: false })
  passwordResetToken?: string;

  @Prop({ type: Date, required: false, select: false })
  passwordResetExpires?: Date;

  @Prop({ type: String, required: false, select: false })
  activationToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (this: UserDocument, next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});
