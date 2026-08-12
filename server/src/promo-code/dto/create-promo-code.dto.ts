import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromoDiscountType } from '../enum/promo-code.enums';

export class CreatePromoCodeDto {
  @ApiProperty({
    description: 'Унікальний код промокоду (2–32 символи).',
    example: 'SUMMER10',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  code: string;

  @ApiProperty({
    description: 'Тип знижки: percent (у відсотках) або fixed (фіксована сума).',
    enum: PromoDiscountType,
    example: PromoDiscountType.PERCENT,
  })
  @IsEnum(PromoDiscountType)
  discountType: PromoDiscountType;

  @ApiProperty({
    description:
      'Розмір знижки. Для percent — 0..100 (%), для fixed — сума знижки у гривнях.',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  // Якщо percent — обмежуємо до 100 (інакше нонсенс).
  @ValidateIf((o: CreatePromoCodeDto) => o.discountType === PromoDiscountType.PERCENT)
  @Max(100)
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Мінімальна сума замовлення, при якій промокод діє.',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  /** null / не передавати — без обмеження кількості використань. */
  @ApiPropertyOptional({
    description:
      'Максимальна кількість використань промокоду. null / не передавати — без обмежень.',
    example: 100,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number | null;

  /** ISO-рядок з датою або null. */
  @ApiPropertyOptional({
    description: 'Дата початку дії промокоду (ISO-8601) або null.',
    example: '2025-01-15T00:00:00.000Z',
    format: 'date-time',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  validFrom?: string | null;

  @ApiPropertyOptional({
    description: 'Дата закінчення дії промокоду (ISO-8601) або null.',
    example: '2025-12-31T23:59:59.000Z',
    format: 'date-time',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  validTo?: string | null;

  @ApiPropertyOptional({
    description: 'Чи активний промокод.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Опис або нотатка до промокоду (до 500 символів).',
    example: 'Літня акція для нових клієнтів',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
