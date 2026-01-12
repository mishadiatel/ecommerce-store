import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  slug: string;

  @IsString()
  image: string;

  @IsString()
  backgroundColor: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateCategoryTranslationDto {
  @IsMongoId()
  categoryId: string;

  @IsString()
  @IsOptional()
  lang: string;

  @IsString()
  name: string;
}
