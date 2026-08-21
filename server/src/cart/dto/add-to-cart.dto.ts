import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GuestCartDto } from './guest-cart.dto';

export class AddToCartDto extends GuestCartDto {
  @ApiProperty({
    description: 'Ідентифікатор товару (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
    format: 'ObjectId',
  })
  @IsMongoId()
  productId: string;

  @ApiProperty({
    description: 'Кількість одиниць товару, які додаються до кошика',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description:
      'SKU обраного варіанта. Обов\'язковий, якщо у товара є варіанти.',
    example: 'SKU-RED-M',
  })
  @IsOptional() @IsString()
  variantSku?: string;
}
