import {  IsOptional, IsString } from 'class-validator';

export class CreateMailTemplateDto {
  @IsString()
  slug: string;

  @IsString()
  subject: string;

  @IsString()
  html: string;

  @IsString()
  @IsOptional()
  language?: string;
}
