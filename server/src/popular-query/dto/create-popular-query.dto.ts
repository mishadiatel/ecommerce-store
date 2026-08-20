import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePopularQueryDto {
  @ApiProperty({
    description: 'Текст популярного запиту (те, що відображається в підказках пошуку).',
    example: 'Кросівки Nike',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  queryText: string;

  @ApiPropertyOptional({
    description: 'Код мови, для якої показувати запит.',
    example: 'ua',
    default: 'ua',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Чи показувати запит користувачам на сайті.',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
