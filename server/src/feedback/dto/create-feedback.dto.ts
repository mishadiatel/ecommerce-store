import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackType } from '../enum/feedback.enums';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Тип заявки — визначає, з якої форми надійшла.',
    enum: FeedbackType,
    example: FeedbackType.CONTACTS,
  })
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @ApiProperty({ description: 'Ім\'я', example: 'Іван' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  firstName: string;

  @ApiProperty({ description: 'Прізвище', example: 'Петренко' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  lastName: string;

  @ApiProperty({ description: 'Номер телефону', example: '+380930419448' })
  @IsString() @IsNotEmpty() @MaxLength(30)
  phoneNumber: string;

  @ApiProperty({
    description: 'Email',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Повідомлення користувача.' })
  @IsOptional() @IsString() @MaxLength(2000)
  message?: string;

  @ApiProperty({
    description: 'Згода на обробку персональних даних.',
    example: true,
  })
  @IsBoolean()
  isAgree: boolean;
}
