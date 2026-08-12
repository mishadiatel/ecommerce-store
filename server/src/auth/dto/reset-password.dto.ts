import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Новий пароль користувача (мінімум 8 символів)',
    minLength: 8,
    example: 'NewStrongPass123',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
