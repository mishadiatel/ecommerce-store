import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
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

  @IsString()
  @IsOptional()
  anotherFirstName?: string;

  @IsString()
  @IsOptional()
  anotherLastName?: string;

  @IsEmail()
  @IsOptional()
  anotherEmail?: string;

  @IsString()
  @IsOptional()
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
}
