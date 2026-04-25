import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  guestId?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsBoolean()
  orderForAnotherPerson: boolean;

  /*
   * Поля отримувача валідуються ТІЛЬКИ якщо orderForAnotherPerson === true
   * АБО якщо в полі щось реально надіслали (не пусте значення).
   * Це прибирає false-positive 400-ки коли фронт шле порожні рядки.
   */
  @ValidateIf(
    (o: CreateOrderDto) =>
      o.orderForAnotherPerson === true ||
      (!!o.anotherFirstName && o.anotherFirstName.trim().length > 0),
  )
  @IsString()
  @IsNotEmpty()
  anotherFirstName?: string;

  @ValidateIf(
    (o: CreateOrderDto) =>
      o.orderForAnotherPerson === true ||
      (!!o.anotherLastName && o.anotherLastName.trim().length > 0),
  )
  @IsString()
  @IsNotEmpty()
  anotherLastName?: string;

  @ValidateIf(
    (o: CreateOrderDto) =>
      o.orderForAnotherPerson === true ||
      (!!o.anotherEmail && o.anotherEmail.trim().length > 0),
  )
  @IsEmail()
  anotherEmail?: string;

  @ValidateIf(
    (o: CreateOrderDto) =>
      o.orderForAnotherPerson === true ||
      (!!o.anotherPhoneNumber && o.anotherPhoneNumber.trim().length > 0),
  )
  @IsString()
  @IsNotEmpty()
  anotherPhoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  deliveryType: string;

  @IsString()
  @IsNotEmpty()
  deliveryCity: string;

  @IsString()
  @IsNotEmpty()
  deliveryWarehouse: string;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsBoolean()
  dontCallMe: boolean;

  @IsBoolean()
  isAgree: boolean;

  /** Опціональний промокод, застосований на checkout-і. */
  @IsOptional()
  @IsString()
  promoCode?: string;
}
