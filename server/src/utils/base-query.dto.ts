import { IsMongoId, IsNumberString, IsOptional, IsString } from 'class-validator';

export class BaseQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  fields?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @IsString()
  isTop?: string;

  @IsOptional()
  @IsString()
  isBottom?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;

  // ── Фільтри каталогу ─────────────────────────────────────
  @IsOptional() @IsNumberString()
  minPrice?: string;

  @IsOptional() @IsNumberString()
  maxPrice?: string;

  /** "true" — сховати товари з outOfStock=true. */
  @IsOptional() @IsString()
  inStockOnly?: string;

  /** Прапорці товарів — приймаємо як строки "true"/"false". */
  @IsOptional() @IsString()
  isNew?: string;

  @IsOptional() @IsString()
  isLimited?: string;

  @IsOptional() @IsString()
  isOnSale?: string;

  @IsOptional() @IsString()
  isOnePlusOne?: string;
}
