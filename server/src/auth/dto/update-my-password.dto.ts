import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMyPasswordDto {
  @ApiProperty({
    description: 'Поточний пароль користувача (мінімум 8 символів)',
    minLength: 8,
    example: 'CurrentPass123',
  })
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty({
    description: 'Новий пароль користувача (мінімум 8 символів)',
    minLength: 8,
    example: 'NewStrongPass123',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
