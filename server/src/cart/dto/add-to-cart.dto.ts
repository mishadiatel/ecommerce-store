import { IsMongoId, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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
}
