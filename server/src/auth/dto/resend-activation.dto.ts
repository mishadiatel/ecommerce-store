import { IsEmail, IsString } from 'class-validator';

export class ResendActivationDto {
  @IsString()
  @IsEmail()
  email: string;
}
