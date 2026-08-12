import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlockDto {
  @ApiProperty({
    description: 'Список сторінок, до яких належить блок',
    example: ['home', 'about'],
  })
  @IsArray()
  @IsString({ each: true })
  pages: string[];

  @ApiProperty({
    description: 'Список підтримуваних мов блока',
    example: ['uk', 'en'],
  })
  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @ApiProperty({
    description: 'Порядок сортування блока',
    example: 1,
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    description: 'Тип блока',
    example: 'hero',
  })
  @IsString()
  blockType: string;

  @ApiPropertyOptional({
    description: 'Прапорець видимості блока',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  visible?: boolean;

  @ApiPropertyOptional({
    description: 'Чи блок розміщено вгорі сторінки',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isTop?: boolean;

  @ApiPropertyOptional({
    description: 'Чи блок розміщено внизу сторінки',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isBottom?: boolean;

  @ApiProperty({
    description: 'Дані блока у вільному форматі',
    example: { title: 'Заголовок', imageUrl: 'https://example.com/image.jpg' },
  })
  @IsObject()
  blockData: Record<string, any>;
}
