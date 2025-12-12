import { IsString, IsOptional } from 'class-validator';

export class CreateSettingsTranslationDto {
  @IsOptional()
  @IsString()
  generalID?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsString()
  schedule: string;
}
