import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateProductDto {
  @IsMongoId()
  categoryId: string;

  @IsString()
  slug: string;

  @IsString()
  cardImage: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsNumber()
  newPrice: number;

  @IsNumber()
  @IsOptional()
  oldPrice?: number;

  @IsNumber()
  @IsOptional()
  reviewsCount?: number;

  @IsNumber()
  @IsOptional()
  discountPercent?: number;

  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @IsBoolean()
  @IsOptional()
  isLimited?: boolean;

  @IsBoolean()
  @IsOptional()
  isOnSale?: boolean;

  @IsBoolean()
  @IsOptional()
  isOnePlusOne?: boolean;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsNumber()
  @IsOptional()
  order: number;
}

export class CreateProductTranslationDto {
  @IsMongoId()
  productId: Types.ObjectId;

  @IsString()
  @IsOptional()
  lang: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  shortDescription: string;

  @IsString()
  @IsOptional()
  longDescription: string;

  @IsString()
  @IsOptional()
  composition: string;

  @IsString()
  @IsOptional()
  expiration: string;

  @IsString()
  @IsOptional()
  nutritionalTable: string;
}
