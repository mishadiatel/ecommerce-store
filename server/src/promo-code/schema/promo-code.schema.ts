import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PromoDiscountType } from '../enum/promo-code.enums';

export type PromoCodeDocument = HydratedDocument<PromoCode>;

@Schema({ timestamps: true })
export class PromoCode {
  /** Текст промокоду (зберігаємо у верхньому регістрі). Унікальний. */
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  /** Тип знижки: percent (відсоток) або fixed (фіксована сума). */
  @Prop({
    type: String,
    enum: [PromoDiscountType.PERCENT, PromoDiscountType.FIXED],
    required: true,
  })
  discountType: PromoDiscountType;

  /** Значення знижки (для percent: 1-100, для fixed: грн). */
  @Prop({ required: true, min: 0 })
  discountValue: number;

  /** Мінімальна сума замовлення для активації. 0 — без обмеження. */
  @Prop({ required: true, default: 0, min: 0 })
  minOrderAmount: number;

  /**
   * Макс. кількість активацій.
   * null або undefined — необмежена кількість.
   */
  @Prop({ type: Number, default: null, min: 1 })
  maxUses: number | null;

  /** Скільки разів промокод уже був активований. */
  @Prop({ required: true, default: 0, min: 0 })
  currentUses: number;

  /** Дата, з якої промокод активний (необов'язкова). */
  @Prop({ type: Date, default: null })
  validFrom: Date | null;

  /** Дата, після якої промокод недійсний (необов'язкова). */
  @Prop({ type: Date, default: null })
  validTo: Date | null;

  /** Чи активний промокод (адмін може вимкнути без видалення). */
  @Prop({ required: true, default: true })
  isActive: boolean;

  /** Короткий опис/коментар для адмін-панелі. */
  @Prop({ type: String, default: '' })
  description: string;
}

export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);

// Унікальний індекс по коду — так само як для orderNumber в замовленнях
PromoCodeSchema.index({ code: 1 }, { unique: true });
