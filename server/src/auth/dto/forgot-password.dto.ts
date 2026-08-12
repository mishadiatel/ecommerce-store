import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email користувача, на який буде надіслано лист для скидання паролю',
    format: 'email',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  email: string;
}
