import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateBannerTranslationDto {
  @IsMongoId() bannerId: Types.ObjectId;
  @IsString() lang: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() text?: string;
  @IsOptional() @IsString() buttonText?: string;
  @IsOptional() @IsString() buttonLink?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() backgroundColor?: string;
}

export class UpdateBannerTranslationDto extends PartialType(
  CreateBannerTranslationDto,
) {}
