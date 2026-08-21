import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class CartItem {
  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: Types.ObjectId;

  @Prop({
    type: Number,
    default: 1,
    min: 1,
  })
  quantity: number;

  /**
   * SKU обраного варіанта. Якщо у товара немає варіантів — null.
   * Разом з productId утворює унікальний ключ рядка корзини.
   */
  @Prop({ type: String, default: null })
  variantSku: string | null;
}

export type CartDocument = HydratedDocument<Cart>;

@Schema({
  timestamps: true,
})
export class Cart {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  })
  userId: Types.ObjectId | null;

  @Prop({
    type: String,
    default: null,
  })
  guestId: string | null;

  @Prop({
    type: [CartItem],
    default: [],
  })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);