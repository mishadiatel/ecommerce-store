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
import { PromoDiscountType } from '../enum/promo-code.enums';

export class CreatePromoCodeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  code: string;

  @IsEnum(PromoDiscountType)
  discountType: PromoDiscountType;

  @IsNumber()
  @Min(0)
  // Якщо percent — обмежуємо до 100 (інакше нонсенс).
  @ValidateIf((o: CreatePromoCodeDto) => o.discountType === PromoDiscountType.PERCENT)
  @Max(100)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  /** null / не передавати — без обмеження кількості використань. */
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number | null;

  /** ISO-рядок з датою або null. */
  @IsOptional()
  @IsString()
  validFrom?: string | null;

  @IsOptional()
  @IsString()
  validTo?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
