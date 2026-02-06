import {
  Body,
  Controller,
  Delete,
  Patch,
  Post, Query,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { GuestCartDto } from './dto/guest-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartQtyDto } from './dto/update-qty.dto';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';

@UseGuards(OptionalAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('get')
  get(@Body() dto: GuestCartDto, @CurrentUser() user: JwtUser | null) {
    return this.cartService.getCart(user, dto.guestId);
  }

  @Post('add')
  add(@Body() dto: AddToCartDto, @CurrentUser() user: JwtUser | null) {
    return this.cartService.addItem(user, dto);
  }

  @Patch('qty')
  qty(@Body() dto: UpdateCartQtyDto, @CurrentUser() user: JwtUser | null) {
    return this.cartService.updateQty(user, dto);
  }

  @Delete('remove')
  remove(@Query() dto: RemoveFromCartDto, @CurrentUser() user: JwtUser | null) {
    return this.cartService.removeItem(user, dto.productId, dto.guestId);
  }
}
