import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  oldPrice: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  /** SKU обраного варіанта (null, якщо у товара не було варіантів). */
  @Prop({ type: String, default: null })
  variantSku: string | null;

  /** Людське ім'я варіанта — денормалізовано, щоб не губити при зміні продукту. */
  @Prop({ type: String, default: '' })
  variantName: string;
}
