import { IsOptional, IsString } from 'class-validator';

export class PromoCodeQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;

  /** 'active' | 'inactive' | не передавати — усі */
  @IsOptional()
  @IsString()
  status?: string;
}
