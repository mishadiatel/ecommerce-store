import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email користувача',
    format: 'email',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Пароль користувача (мінімум 8 символів)',
    minLength: 8,
    example: 'StrongPass123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'Токен активації акаунту користувача',
    example: 'a1b2c3d4e5f6...',
  })
  @IsString()
  @IsOptional()
  activationToken: string;
}
