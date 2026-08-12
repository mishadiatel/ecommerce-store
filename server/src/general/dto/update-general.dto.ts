import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGeneralDto {
  @ApiPropertyOptional({
    description: 'Назва компанії',
    example: 'ТОВ "Приклад"',
  })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({
    description: 'URL логотипу компанії',
    example: 'https://example.com/logo.png',
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({
    description: 'URL фавіконки сайту',
    example: 'https://example.com/favicon.ico',
  })
  @IsString()
  @IsOptional()
  favicon?: string;

  @ApiPropertyOptional({
    description: 'Посилання на Instagram',
    example: 'https://instagram.com/example',
  })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({
    description: 'Посилання на Facebook',
    example: 'https://facebook.com/example',
  })
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiPropertyOptional({
    description: 'Посилання на TikTok',
    example: 'https://tiktok.com/@example',
  })
  @IsString()
  @IsOptional()
  tiktok?: string;

  @ApiPropertyOptional({
    description: 'Посилання на Telegram',
    example: 'https://t.me/example',
  })
  @IsString()
  @IsOptional()
  telegram?: string;

  @ApiPropertyOptional({
    description: 'Контактний номер телефону',
    example: '+380501234567',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Контактна електронна пошта',
    example: 'info@example.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Email для сервісу Mailjet',
    example: 'no-reply@example.com',
  })
  @IsString()
  @IsOptional()
  mailjetEmail?: string;

  @ApiPropertyOptional({
    description: 'Ім\'я відправника для сервісу Mailjet',
    example: 'Example Shop',
  })
  @IsString()
  @IsOptional()
  mailjetName?: string;
}
