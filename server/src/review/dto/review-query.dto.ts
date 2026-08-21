import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '../../utils/base-query.dto';

export class ReviewQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Фільтр за ID товару' })
  @IsOptional() @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Фільтр за мовою відгуку', example: 'ua' })
  @IsOptional() @IsString()
  language?: string;

  @ApiPropertyOptional({ description: '"true"/"false" — фільтр видимості' })
  @IsOptional() @IsString()
  isVisible?: string;
}
