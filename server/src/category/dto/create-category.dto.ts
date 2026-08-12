import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Унікальний slug категорії',
    example: 'cakes',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'URL зображення категорії',
    example: 'https://cdn.example.com/categories/cakes.jpg',
  })
  @IsString()
  image: string;

  @ApiProperty({
    description: 'Колір фону картки категорії у форматі HEX',
    example: '#FFE4C4',
  })
  @IsString()
  backgroundColor: string;

  @ApiPropertyOptional({
    description: 'Видимість категорії у публічному каталозі',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Порядок сортування категорії',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateCategoryTranslationDto {
  @ApiProperty({
    description: 'Ідентифікатор категорії (MongoID), до якої належить переклад',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @IsMongoId()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Код мови перекладу (ISO 639-1)',
    example: 'uk',
  })
  @IsString()
  @IsOptional()
  lang: string;

  @ApiProperty({
    description: 'Локалізована назва категорії',
    example: 'Торти',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Локалізований заголовок сторінки категорії (SEO title)',
    example: 'Торти з доставкою — свіжа випічка на замовлення',
  })
  @IsString()
  pageTitle: string;

  @ApiProperty({
    description: 'Локалізований опис сторінки категорії (SEO description)',
    example: 'Замовляйте свіжі домашні торти з доставкою по місту.',
  })
  @IsString()
  pageDescription: string;
}
