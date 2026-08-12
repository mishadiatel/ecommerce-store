import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateBannerTranslationDto {
  @ApiProperty({
    description: 'Ідентифікатор банера (MongoID)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'validation.id' })
  bannerId: string;

  @ApiProperty({
    description: 'Код мови перекладу',
    example: 'uk',
  })
  @IsNotEmpty({ message: 'validation.required' })
  @IsString({ message: 'validation.string' })
  lang: string;

  @ApiPropertyOptional({
    description: 'Заголовок банера',
    example: 'Літній розпродаж',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Текст банера',
    example: 'Знижки до 50% на весь асортимент',
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({
    description: 'Текст на кнопці',
    example: 'Придбати зараз',
  })
  @IsOptional()
  @IsString()
  buttonText?: string;

  @ApiPropertyOptional({
    description: 'Посилання кнопки',
    example: '/catalog',
  })
  @IsOptional()
  @IsString()
  buttonLink?: string;

  @ApiPropertyOptional({
    description: 'URL зображення банера',
    example: 'https://example.com/banner.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Колір фону банера у форматі HEX',
    example: '#ff5733',
  })
  @IsOptional()
  @IsString()
  backgroundColor?: string;
}

export class UpdateBannerTranslationDto extends PartialType(
  CreateBannerTranslationDto,
) {}
