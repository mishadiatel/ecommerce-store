import { IsMongoId } from 'class-validator';
import { GuestCartDto } from './guest-cart.dto';

export class RemoveFromCartDto extends GuestCartDto {
  @IsMongoId()
  productId: string;
}
