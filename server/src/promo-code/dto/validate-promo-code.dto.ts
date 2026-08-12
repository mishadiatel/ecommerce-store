import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidatePromoCodeDto {
  @ApiProperty({
    description: 'Код промокоду, який потрібно перевірити.',
    example: 'SUMMER10',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  /**
   * guestId для гостевих корзин.
   * Якщо користувач залогінений — використовується userId з токену
   * (через OptionalAuthGuard), і guestId ігнорується.
   */
  @ApiPropertyOptional({
    description:
      'guestId для гостевих корзин. Якщо користувач залогінений — використовується userId з токену, і guestId ігнорується.',
    example: 'guest_1a2b3c4d5e',
  })
  @IsOptional()
  @IsString()
  guestId?: string;
}
