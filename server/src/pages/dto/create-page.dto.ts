import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({
    description: 'Slug сторінки',
    example: 'about-us',
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'Мета-заголовок сторінки',
    example: 'Про нас',
  })
  @IsString()
  @IsOptional()
  title: string;

  @ApiPropertyOptional({
    description: 'Мета-опис сторінки',
    example: 'Дізнайтеся більше про нашу компанію.',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    description: 'Заголовок у хлібних крихтах',
    example: 'Про нас',
  })
  @IsString()
  @IsOptional()
  breadcrumbTitle?: string;

  @ApiPropertyOptional({
    description: 'Код мови сторінки',
    example: 'uk',
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    description: 'Чи індексувати сторінку пошуковими системами',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  index: boolean;

  @ApiPropertyOptional({
    description: 'Чи переходити пошуковим ботам за посиланнями',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  follow: boolean;
}
