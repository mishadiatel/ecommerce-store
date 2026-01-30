import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}
  // ✅ AUTH USER WISHLIST
  @UseGuards(AccessTokenGuard)
  @Get()
  async getWishlist(@CurrentUser() user: JwtUser) {
    const wishlist = await this.wishlistService.getOrCreate(user.sub);
    // return this.productService.findByIdsWithTranslation(
    //   wishlist.productIds,
    //
    // );
    return wishlist;
  }

  @UseGuards(AccessTokenGuard)
  @Post(':productId')
  add(@CurrentUser() user: JwtUser, @Param('productId') productId: string) {
    return this.wishlistService.add(user.sub, productId);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':productId')
  remove(@CurrentUser() user: JwtUser, @Param('productId') productId: string) {
    return this.wishlistService.remove(user.sub, productId);
  }

  @UseGuards(AccessTokenGuard)
  @Post('merge')
  async mergeGuest(
    @CurrentUser() user: JwtUser,
    @Body('productIds') productIds: string[],
  ) {
    await Promise.all(
      productIds.map(async (id) => this.wishlistService.add(user.sub, id)),
    );

    return this.wishlistService.getOrCreate(user.sub);
  }
}
