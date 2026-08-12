import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GuestCartDto {
  @ApiPropertyOptional({
    description: 'Ідентифікатор гостьового кошика (для неавторизованих користувачів)',
    example: 'guest-1a2b3c4d5e6f',
  })
  @IsOptional()
  @IsString()
  guestId?: string;
}
