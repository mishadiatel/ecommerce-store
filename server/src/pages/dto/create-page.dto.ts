import { IsOptional, IsString } from 'class-validator';

export class CreatePageDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  robots: string;

  @IsString()
  @IsOptional()
  language?: string;
}
