import { IsMongoId, IsNumber, Min } from 'class-validator';
import { GuestCartDto } from './guest-cart.dto';

export class UpdateCartQtyDto extends GuestCartDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
