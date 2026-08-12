import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetBannersQueryDto {
  @ApiPropertyOptional({
    description: 'Номер сторінки для пагінації',
    example: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Кількість елементів на сторінці',
    example: 10,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Поле для сортування',
    example: 'order',
  })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Напрямок сортування',
    example: 'asc',
  })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Фільтр за видимістю банера',
    example: 'true',
  })
  @IsOptional()
  visible?: string;
}
