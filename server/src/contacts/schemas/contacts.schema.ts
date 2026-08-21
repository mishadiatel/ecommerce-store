import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactsDocument = Contacts & Document;

/** Одна адреса виробництва — місто, індекс, багаторядкова адреса. */
@Schema({ _id: false })
export class ProductionAddress {
  @Prop({ type: String, default: '' })
  city: string;

  @Prop({ type: String, default: '' })
  postcode: string;

  @Prop({ type: String, default: '' })
  address: string;
}

const ProductionAddressSchema = SchemaFactory.createForClass(ProductionAddress);

/**
 * Контент блоку "Контакти" на сайті — один документ на мову.
 * Керується адміном; клієнт витягує через публічний GET.
 */
@Schema({ timestamps: true })
export class Contacts {
  @Prop({ type: String, required: true, default: 'ua', unique: true })
  language: string;

  // Ліва колонка — секції
  @Prop({ type: String, default: '' })
  salesTitle: string; // "Відділ збуту та підтримки споживачів:"

  @Prop({ type: [String], default: [] })
  phones: string[];

  @Prop({ type: [String], default: [] })
  emails: string[];

  @Prop({ type: String, default: '' })
  productionTitle: string; // "Виробництво:"

  /**
   * Масив адрес виробництва. Кожна адреса — окремий блок з
   * містом, індексом та багаторядковою адресою.
   */
  @Prop({ type: [ProductionAddressSchema], default: [] })
  productionAddresses: ProductionAddress[];

  @Prop({ type: String, default: '' })
  socialTitle: string; // "Ми в соцмережах:"

  @Prop({ type: String, default: '' })
  facebookUrl: string;

  @Prop({ type: String, default: '' })
  instagramUrl: string;

  // Права колонка — форма
  @Prop({ type: String, default: '' })
  formTitle: string; // "Маєте запитання?"
}

export const ContactsSchema = SchemaFactory.createForClass(Contacts);
ContactsSchema.index({ language: 1 }, { unique: true });
