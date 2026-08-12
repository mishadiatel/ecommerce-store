import { IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiPropertyOptional({
    description: 'Прапорець видимості банера',
    example: true,
  })
  @IsOptional() @IsBoolean() visible?: boolean;

  @ApiPropertyOptional({
    description: 'Порядок сортування банерів',
    example: 1,
  })
  @IsOptional() @IsInt() order?: number;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
