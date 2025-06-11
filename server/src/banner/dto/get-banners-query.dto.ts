import { IsOptional } from 'class-validator';

export class GetBannersQueryDto {
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
