import { IsMongoId, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GuestCartDto } from './guest-cart.dto';

export class UpdateCartQtyDto extends GuestCartDto {
  @ApiProperty({
    description: 'Ідентифікатор товару, для якого оновлюється кількість (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
    format: 'ObjectId',
  })
  @IsMongoId()
  productId: string;

  @ApiProperty({
    description: 'Нова кількість одиниць товару в кошику',
    example: 3,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}
