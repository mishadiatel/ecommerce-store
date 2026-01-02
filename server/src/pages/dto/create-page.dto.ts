import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePageDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

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
