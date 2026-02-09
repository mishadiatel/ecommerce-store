import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePageDto {
  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  breadcrumbTitle?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsBoolean()
  @IsOptional()
  index: boolean;

  @IsBoolean()
  @IsOptional()
  follow: boolean;
}
