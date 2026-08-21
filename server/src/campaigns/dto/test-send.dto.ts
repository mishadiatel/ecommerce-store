import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TestSendDto {
  @ApiProperty({
    description: 'Email адміна для тестової доставки листа',
    example: 'admin@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;
}
