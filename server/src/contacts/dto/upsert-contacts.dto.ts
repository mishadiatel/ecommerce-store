import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductionAddressDto {
  @ApiPropertyOptional({ description: 'Місто', example: 'м. Чернігів' })
  @IsOptional() @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Індекс', example: 'індекс: 14021' })
  @IsOptional() @IsString()
  postcode?: string;

  @ApiPropertyOptional({
    description: 'Адреса (може містити \\n для нового рядка).',
    example: 'пров. Старобілоуський, 4а\nвул. Інструментальна, 9',
  })
  @IsOptional() @IsString()
  address?: string;
}

export class UpsertContactsDto {
  @ApiProperty({
    description: 'Код мови, до якої відноситься набір контактів.',
    example: 'ua',
  })
  @IsString()
  language: string;

  @ApiPropertyOptional({ description: 'Заголовок секції продажу.' })
  @IsOptional() @IsString()
  salesTitle?: string;

  @ApiPropertyOptional({
    description: 'Телефони.',
    type: [String],
    example: ['+380930419448', '+380937319901'],
  })
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true })
  phones?: string[];

  @ApiPropertyOptional({
    description: 'Email адреси.',
    type: [String],
    example: ['info@example.com'],
  })
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true })
  emails?: string[];

  @ApiPropertyOptional({ description: 'Заголовок секції виробництва.' })
  @IsOptional() @IsString()
  productionTitle?: string;

  @ApiPropertyOptional({
    description: 'Список адрес виробництва.',
    type: () => ProductionAddressDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProductionAddressDto)
  productionAddresses?: ProductionAddressDto[];

  @ApiPropertyOptional({ description: 'Заголовок секції соцмереж.' })
  @IsOptional() @IsString()
  socialTitle?: string;

  @ApiPropertyOptional({ description: 'URL Facebook сторінки.' })
  @IsOptional() @IsString()
  facebookUrl?: string;

  @ApiPropertyOptional({ description: 'URL Instagram сторінки.' })
  @IsOptional() @IsString()
  instagramUrl?: string;

  @ApiPropertyOptional({ description: 'Заголовок форми зворотного зв\'язку.' })
  @IsOptional() @IsString()
  formTitle?: string;
}
