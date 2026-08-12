import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMailTemplateDto {
  @ApiProperty({
    description: 'Slug шаблону листа',
    example: 'welcome-email',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Тема листа',
    example: 'Ласкаво просимо!',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'HTML-контент шаблону листа',
    example: '<p>Ласкаво просимо!</p>',
  })
  @IsString()
  html: string;

  @ApiPropertyOptional({
    description: 'Код мови шаблону',
    example: 'uk',
  })
  @IsString()
  @IsOptional()
  language?: string;
}
