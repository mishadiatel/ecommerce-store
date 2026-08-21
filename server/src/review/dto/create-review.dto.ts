import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID товару (MongoID)', example: '65f0c3b1e2a1b2c3d4e5f6a7' })
  @IsMongoId()
  productId: string;

  @ApiPropertyOptional({ description: 'Мова відгуку', example: 'ua', default: 'ua' })
  @IsOptional() @IsString()
  language?: string;

  @ApiProperty({ description: 'Ім\'я автора', example: 'Оксана' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  firstName: string;

  @ApiProperty({ description: 'Прізвище автора', example: 'Коробєйнікова' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  lastName: string;

  @ApiProperty({ description: 'Оцінка від 1 до 5', example: 5, minimum: 1, maximum: 5 })
  @IsInt() @Min(1) @Max(5)
  rating: number;

  @ApiProperty({ description: 'Текст відгуку', example: 'Дуже смачно!' })
  @IsString() @MinLength(1) @MaxLength(2000)
  comment: string;

  @ApiPropertyOptional({ description: 'Чи видимий на сайті', example: true, default: true })
  @IsOptional() @IsBoolean()
  isVisible?: boolean;
}
