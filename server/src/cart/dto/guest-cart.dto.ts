import { IsOptional, IsString } from 'class-validator';

export class GuestCartDto {
  @IsOptional()
  @IsString()
  guestId?: string;
}
