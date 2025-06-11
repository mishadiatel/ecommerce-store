import { IsOptional, IsBoolean, IsInt } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateBannerDto {
  @IsOptional() @IsBoolean() visible?: boolean;
  @IsOptional() @IsInt() order?: number;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
