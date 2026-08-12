import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendActivationDto {
  @ApiProperty({
    description: 'Email користувача, на який буде повторно надіслано лист активації',
    format: 'email',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  email: string;
}
