import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GuestCartDto } from './guest-cart.dto';

export class RemoveFromCartDto extends GuestCartDto {
  @ApiProperty({
    description: 'Ідентифікатор товару, який потрібно видалити з кошика (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
    format: 'ObjectId',
  })
  @IsMongoId()
  productId: string;

  @ApiPropertyOptional({
    description: 'SKU варіанта (якщо позиція корзини з варіантом).',
  })
  @IsOptional() @IsString()
  variantSku?: string;
}
