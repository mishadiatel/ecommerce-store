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

export class UpdatePromoCodeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  code?: string;

  @IsOptional()
  @IsEnum(PromoDiscountType)
  discountType?: PromoDiscountType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ValidateIf(
    (o: UpdatePromoCodeDto) => o.discountType === PromoDiscountType.PERCENT,
  )
  @Max(100)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number | null;

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
