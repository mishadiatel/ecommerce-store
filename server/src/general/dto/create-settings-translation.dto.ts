import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettingsTranslationDto {
  @ApiPropertyOptional({
    description: 'Ідентифікатор загальних налаштувань',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  generalID?: string;

  @ApiPropertyOptional({
    description: 'Код мови перекладу',
    example: 'uk',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Графік роботи магазину',
    example: 'Пн-Пт: 09:00-18:00',
  })
  @IsString()
  schedule: string;

  @ApiPropertyOptional({
    description: 'Інформація про оплату',
    example: 'Приймаємо оплату карткою або готівкою.',
  })
  @IsString()
  @IsOptional()
  payInfo?: string;

  @ApiPropertyOptional({
    description: 'Інформація про доставку',
    example: 'Доставка Новою Поштою по всій Україні.',
  })
  @IsString()
  @IsOptional()
  deliveryInfo?: string;
}
