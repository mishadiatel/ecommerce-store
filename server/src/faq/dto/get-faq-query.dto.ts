import { IsOptional } from 'class-validator';

export class GetFaqQueryDto {
  @IsOptional()
  page?: number;
  @IsOptional()
  limit?: number;
  @IsOptional()
  sortBy?: string;
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
  @IsOptional()
  visible?: string;
}
