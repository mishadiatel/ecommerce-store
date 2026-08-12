import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFaqCategoryDto {
  @ApiPropertyOptional({
    description: 'Прапорець видимості категорії FAQ',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  visible: boolean;
}
