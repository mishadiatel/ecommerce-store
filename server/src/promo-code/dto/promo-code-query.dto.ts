import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PromoCodeQueryDto {
  @ApiPropertyOptional({
    description: 'Кількість промокодів на сторінку.',
    example: '20',
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Номер сторінки (починаючи з 1).',
    example: '1',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    description: 'Пошук за кодом або описом промокоду.',
    example: 'SUMMER',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Порядок сортування за датою створення: "asc" або "desc".',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: string;

  /** 'active' | 'inactive' | не передавати — усі */
  @ApiPropertyOptional({
    description: 'Фільтр за статусом: "active" | "inactive" | не передавати — усі.',
    example: 'active',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
