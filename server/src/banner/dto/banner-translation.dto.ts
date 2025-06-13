import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateBannerTranslationDto {
  @IsMongoId({ message: 'validation.id' })
  bannerId: string;

  @IsNotEmpty({ message: 'validation.required' })
  @IsString({ message: 'validation.string' })
  lang: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  buttonText?: string;

  @IsOptional()
  @IsString()
  buttonLink?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;
}

export class UpdateBannerTranslationDto extends PartialType(
  CreateBannerTranslationDto,
) {}
