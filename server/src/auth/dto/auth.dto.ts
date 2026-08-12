import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
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
}
