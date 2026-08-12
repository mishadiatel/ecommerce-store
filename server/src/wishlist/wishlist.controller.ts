import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}
  // ✅ AUTH USER WISHLIST
  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Отримати список бажань користувача',
    description:
      'Повертає список бажань поточного авторизованого користувача. Якщо списку ще не існує — створює новий порожній список.',
  })
  @ApiResponse({ status: 200, description: 'Список бажань успішно отримано' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
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
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Додати товар до списку бажань',
    description:
      'Додає товар у список бажань поточного користувача. Ідемпотентно: повторне додавання того ж товару не призводить до дублювання.',
  })
  @ApiParam({
    name: 'productId',
    description: 'Ідентифікатор товару (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 201, description: 'Товар успішно додано до списку бажань' })
  @ApiResponse({ status: 400, description: 'Некоректний ідентифікатор товару' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({ status: 404, description: 'Товар не знайдено' })
  add(@CurrentUser() user: JwtUser, @Param('productId') productId: string) {
    return this.wishlistService.add(user.sub, productId);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':productId')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Видалити товар зі списку бажань',
    description:
      'Видаляє вказаний товар зі списку бажань поточного авторизованого користувача.',
  })
  @ApiParam({
    name: 'productId',
    description: 'Ідентифікатор товару (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Товар успішно видалено зі списку бажань' })
  @ApiResponse({ status: 400, description: 'Некоректний ідентифікатор товару' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({ status: 404, description: 'Товар або список бажань не знайдено' })
  remove(@CurrentUser() user: JwtUser, @Param('productId') productId: string) {
    return this.wishlistService.remove(user.sub, productId);
  }

  @UseGuards(AccessTokenGuard)
  @Post('merge')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Об’єднати гостьовий список бажань з обліковим записом',
    description:
      'Приймає масив productIds із гостьового списку бажань і додає всі товари у список бажань поточного користувача. Повертає оновлений список.',
  })
  @ApiResponse({ status: 201, description: 'Списки бажань успішно об’єднано' })
  @ApiResponse({ status: 400, description: 'Некоректний список товарів' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
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
