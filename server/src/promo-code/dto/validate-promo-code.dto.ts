import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ValidatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  /**
   * guestId для гостевих корзин.
   * Якщо користувач залогінений — використовується userId з токену
   * (через OptionalAuthGuard), і guestId ігнорується.
   */
  @IsOptional()
  @IsString()
  guestId?: string;
}
