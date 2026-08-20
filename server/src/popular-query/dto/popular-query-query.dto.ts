import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '../../utils/base-query.dto';

export class PopularQueryQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Фільтр за кодом мови.',
    example: 'ua',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Фільтр видимості. "true" — тільки видимі, "false" — тільки приховані.',
    example: 'true',
  })
  @IsOptional()
  @IsString()
  visible?: string;
}
