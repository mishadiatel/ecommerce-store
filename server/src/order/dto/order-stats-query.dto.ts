import { IsInt, IsISO8601, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OrderStatsQueryDto {
  @ApiPropertyOptional({
    description: 'Початок діапазону за датою створення замовлень (ISO-8601 / YYYY-MM-DD).',
    example: '2025-01-01',
    format: 'date',
  })
  @IsOptional()
  @IsISO8601({ strict: false })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Кінець діапазону за датою створення замовлень (ISO-8601 / YYYY-MM-DD).',
    example: '2025-01-31',
    format: 'date',
  })
  @IsOptional()
  @IsISO8601({ strict: false })
  dateTo?: string;
}

export class TopProductsQueryDto extends OrderStatsQueryDto {
  @ApiPropertyOptional({
    description: 'Кількість топ-товарів у відповіді.',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Метрика для сортування: revenue (за виручкою) або quantity (за кількістю).',
    example: 'revenue',
    enum: ['revenue', 'quantity'],
  })
  @IsOptional()
  @IsString()
  sortBy?: 'revenue' | 'quantity';
}

export class OrderTimelineQueryDto extends OrderStatsQueryDto {
  @ApiPropertyOptional({
    description: 'Гранулярність часової осі: day / week / month.',
    example: 'day',
    enum: ['day', 'week', 'month'],
  })
  @IsOptional()
  @IsString()
  granularity?: 'day' | 'week' | 'month';
}
