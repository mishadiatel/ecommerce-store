import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBlockDto {
  @IsArray()
  @IsString({ each: true })
  pages: string[];

  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @IsNumber()
  order: number;

  @IsString()
  blockType: string;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;

  @IsBoolean()
  @IsOptional()
  isTop?: boolean;

  @IsBoolean()
  @IsOptional()
  isBottom?: boolean;

  @IsObject()
  blockData: Record<string, any>;
}
