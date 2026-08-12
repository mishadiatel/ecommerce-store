import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GuestCartDto } from './guest-cart.dto';

export class RemoveFromCartDto extends GuestCartDto {
  @ApiProperty({
    description: 'Ідентифікатор товару, який потрібно видалити з кошика (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
    format: 'ObjectId',
  })
  @IsMongoId()
  productId: string;
}
