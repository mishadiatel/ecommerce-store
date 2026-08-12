import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Імʼя користувача',
    example: 'Іван',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Прізвище користувача',
    example: 'Петренко',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Номер телефону користувача',
    example: '+380501234567',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Дата народження користувача (ISO 8601)',
    example: '1990-05-15',
  })
  @IsOptional()
  @IsDateString()
  birthDay?: string;

  @ApiPropertyOptional({
    description: 'Чи активований акаунт користувача',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActivated?: boolean;

  @ApiPropertyOptional({
    description: 'Email користувача',
    format: 'email',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Пароль користувача',
    example: 'StrongPass123',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'Refresh токен користувача',
    nullable: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string | null;

  @ApiPropertyOptional({
    description: 'Дата останньої зміни паролю (ISO 8601)',
    example: '2025-01-15T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  passwordChangedAt?: string;

  @ApiPropertyOptional({
    description: 'Токен скидання паролю',
    example: 'a1b2c3d4e5f6...',
  })
  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @ApiPropertyOptional({
    description: 'Дата закінчення дії токену скидання паролю (ISO 8601)',
    example: '2025-01-15T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  passwordResetExpires?: string;

  @ApiPropertyOptional({
    description: 'Токен активації акаунту',
    example: 'a1b2c3d4e5f6...',
  })
  @IsOptional()
  @IsString()
  activationToken?: string;

  @ApiPropertyOptional({
    description: 'Роль користувача',
    example: 'user',
  })
  @IsOptional()
  @IsString()
  role?: string;
}
