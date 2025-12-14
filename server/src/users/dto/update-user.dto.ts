import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsDateString()
  birthDay?: string;

  @IsOptional()
  @IsBoolean()
  isActivated?: boolean;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string | null;

  @IsOptional()
  @IsDateString()
  passwordChangedAt?: string;

  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @IsOptional()
  @IsDateString()
  passwordResetExpires?: string;

  @IsOptional()
  @IsString()
  activationToken?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
