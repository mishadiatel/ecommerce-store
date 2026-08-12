import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Ідентифікатор категорії (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @IsMongoId()
  categoryId: string;

  @ApiProperty({
    description: 'Унікальний slug продукту',
    example: 'chocolate-cake',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'URL головного зображення (картки) продукту',
    example: 'https://cdn.example.com/products/chocolate-cake/card.jpg',
  })
  @IsString()
  cardImage: string;

  @ApiProperty({
    description: 'Масив URL додаткових зображень продукту',
    example: [
      'https://cdn.example.com/products/chocolate-cake/1.jpg',
      'https://cdn.example.com/products/chocolate-cake/2.jpg',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({
    description: 'Нова (актуальна) ціна продукту',
    example: 249.99,
  })
  @IsNumber()
  newPrice: number;

  @ApiPropertyOptional({
    description: 'Стара ціна продукту (до знижки)',
    example: 299.99,
  })
  @IsNumber()
  @IsOptional()
  oldPrice?: number;

  @ApiPropertyOptional({
    description: 'Кількість відгуків про продукт',
    example: 12,
  })
  @IsNumber()
  @IsOptional()
  reviewsCount?: number;

  @ApiPropertyOptional({
    description: 'Відсоток знижки',
    example: 15,
  })
  @IsNumber()
  @IsOptional()
  discountPercent?: number;

  @ApiPropertyOptional({
    description: 'Ознака "новинка"',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @ApiPropertyOptional({
    description: 'Ознака обмеженої серії',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isLimited?: boolean;

  @ApiPropertyOptional({
    description: 'Ознака "в продажу зі знижкою"',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isOnSale?: boolean;

  @ApiPropertyOptional({
    description: 'Ознака акції "1+1"',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isOnePlusOne?: boolean;

  @ApiPropertyOptional({
    description: 'Видимість продукту у публічному каталозі',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Порядок сортування продукту',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  order: number;
}

export class CreateProductTranslationDto {
  @ApiProperty({
    description: 'Ідентифікатор продукту (MongoID), до якого належить переклад',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @IsMongoId()
  productId: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Код мови перекладу (ISO 639-1)',
    example: 'uk',
  })
  @IsString()
  @IsOptional()
  lang: string;

  @ApiProperty({
    description: 'Локалізована назва продукту',
    example: 'Шоколадний торт',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Короткий локалізований опис продукту',
    example: 'Ніжний торт із бельгійського шоколаду',
  })
  @IsString()
  @IsOptional()
  shortDescription: string;

  @ApiPropertyOptional({
    description: 'Повний локалізований опис продукту',
    example: 'Багатошаровий торт із бісквіту, крему та шоколадної глазурі...',
  })
  @IsString()
  @IsOptional()
  longDescription: string;

  @ApiPropertyOptional({
    description: 'Склад продукту (локалізовано)',
    example: 'Борошно, цукор, яйця, какао, вершкове масло',
  })
  @IsString()
  @IsOptional()
  composition: string;

  @ApiPropertyOptional({
    description: 'Термін придатності (локалізовано)',
    example: '5 днів у холодильнику',
  })
  @IsString()
  @IsOptional()
  expiration: string;

  @ApiPropertyOptional({
    description: 'Таблиця харчової цінності (локалізовано)',
    example: 'Калорії: 350 ккал; Білки: 5 г; Жири: 20 г; Вуглеводи: 40 г',
  })
  @IsString()
  @IsOptional()
  nutritionalTable: string;
}
