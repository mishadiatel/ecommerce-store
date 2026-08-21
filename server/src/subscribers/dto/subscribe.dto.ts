import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({ description: 'Email підписника', example: 'user@example.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Джерело підписки', example: 'footer' })
  @IsOptional() @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Мова сайту в момент підписки', example: 'ua' })
  @IsOptional() @IsString()
  locale?: string;
}
