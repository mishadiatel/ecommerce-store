import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Атрибут варіанта — пара ключ-значення.
 * Наприклад: { name: 'Розмір', value: 'M' } / { name: 'Колір', value: 'Червоний' }.
 */
@Schema({ _id: false })
export class VariantAttribute {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  value: string;
}

const VariantAttributeSchema = SchemaFactory.createForClass(VariantAttribute);

/**
 * Варіант товару.
 * Кожен варіант має власний SKU, ціну і залишки.
 */
@Schema({ _id: true, timestamps: false })
export class ProductVariant {
  @Prop({ type: String, required: true })
  sku: string;

  /**
   * Людське ім'я варіанта — те, що показуємо клієнту.
   * Може бути автоматично складене з атрибутів (наприклад "Червоний / M")
   * або задане адміном явно.
   */
  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ type: [VariantAttributeSchema], default: [] })
  attributes: VariantAttribute[];

  @Prop({ type: Number, required: true, min: 0 })
  newPrice: number;

  @Prop({ type: Number, required: false, min: 0 })
  oldPrice?: number;

  @Prop({ type: Number, default: 0, min: 0 })
  stock: number;

  /**
   * Явний прапорець "немає в наявності". Керується адміном. Якщо true —
   * варіант неможливо додати в кошик і замовити.
   */
  @Prop({ type: Boolean, default: false })
  outOfStock: boolean;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  /** Опціональне окреме зображення варіанту (посилання на файл в /uploads). */
  @Prop({ type: String, default: '' })
  image?: string;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);
