import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'Ідентифікатор гостевої сесії (використовується, якщо користувач не авторизований).',
    example: 'guest_1a2b3c4d5e',
  })
  @IsOptional()
  @IsString()
  guestId?: string;

  @ApiProperty({
    description: 'Email покупця.',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Ім’я покупця.',
    example: 'Іван',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Прізвище покупця.',
    example: 'Петренко',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Номер телефону покупця.',
    example: '+380671234567',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Чи оформлюється замовлення для іншої людини (отримувача).',
    example: false,
  })
  @IsBoolean()
  orderForAnotherPerson: boolean;

  /*
   * Поля отримувача валідуються ТІЛЬКИ якщо orderForAnotherPerson === true
   * АБО якщо в полі щось реально надіслали (не пусте значення).
   * Це прибирає false-positive 400-ки коли фронт шле порожні рядки.
   */
  @ApiPropertyOptional({
    description: 'Ім’я отримувача (якщо замовлення для іншої людини).',
    example: 'Олена',
  })
  @ValidateIf(
    (o: CreateOrderDto) =>
      o.orderForAnotherPerson === true ||
      (!!o.anotherFirstName && o.anotherFirstName.trim().length > 0),
  )
  @IsString()
  @IsNotEmpty()
  anotherFirstName?: string;

  @ApiPropertyOptional({
    description: 'Прізвище отримувача (якщо замовлення для іншої людини).',
    example: 'Коваленко',
  })
  @ValidateIf(
    (o: CreateOrderDto) =>
      o.orderForAnotherPerson === true ||
      (!!o.anotherLastName && o.anotherLastName.trim().length > 0),
  )
  @IsString()
  @IsNotEmpty()
  anotherLastName?: string;

  @ApiPropertyOptional({
    description: 'Email отримувача (якщо замовлення для іншої людини).',
    example: 'recipient@example.com',
    format: 'email',
  })
  @ValidateIf(
    (o: CreateOrderDto) =>
      o.orderForAnotherPerson === true ||
      (!!o.anotherEmail && o.anotherEmail.trim().length > 0),
  )
  @IsEmail()
  anotherEmail?: string;

  @ApiPropertyOptional({
    description: 'Номер телефону отримувача (якщо замовлення для іншої людини).',
    example: '+380677654321',
  })
  @ValidateIf(
    (o: CreateOrderDto) =>
      o.orderForAnotherPerson === true ||
      (!!o.anotherPhoneNumber && o.anotherPhoneNumber.trim().length > 0),
  )
  @IsString()
  @IsNotEmpty()
  anotherPhoneNumber?: string;

  @ApiProperty({
    description: 'Тип доставки (наприклад, Нова Пошта, кур’єр).',
    example: 'nova_poshta_warehouse',
  })
  @IsString()
  @IsNotEmpty()
  deliveryType: string;

  @ApiProperty({
    description: 'Місто доставки.',
    example: 'Київ',
  })
  @IsString()
  @IsNotEmpty()
  deliveryCity: string;

  @ApiProperty({
    description: 'Відділення або адреса доставки.',
    example: 'Відділення №42',
  })
  @IsString()
  @IsNotEmpty()
  deliveryWarehouse: string;

  @ApiProperty({
    description: 'Метод оплати (online / cash_on_delivery).',
    example: 'online',
  })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({
    description: 'Коментар до замовлення від покупця.',
    example: 'Дзвонити після 18:00',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Не передзвонювати для підтвердження замовлення.',
    example: false,
  })
  @IsBoolean()
  dontCallMe: boolean;

  @ApiProperty({
    description: 'Згода з умовами та політикою конфіденційності.',
    example: true,
  })
  @IsBoolean()
  isAgree: boolean;

  /** Опціональний промокод, застосований на checkout-і. */
  @ApiPropertyOptional({
    description: 'Опціональний промокод, застосований на checkout-і.',
    example: 'SUMMER10',
  })
  @IsOptional()
  @IsString()
  promoCode?: string;
}
