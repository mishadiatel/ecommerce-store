import {
  Body,
  Controller,
  Delete,
  Patch,
  Post, Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { GuestCartDto } from './dto/guest-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartQtyDto } from './dto/update-qty.dto';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';

@ApiTags('Cart')
@UseGuards(OptionalAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('get')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Отримати вміст кошика',
    description:
      'Повертає кошик авторизованого користувача або гостьовий кошик за guestId. Авторизація опціональна: якщо користувач увійшов у систему — повертається його кошик, інакше — гостьовий кошик за переданим guestId.',
  })
  @ApiResponse({ status: 201, description: 'Кошик успішно отримано' })
  @ApiResponse({ status: 400, description: 'Некоректні вхідні дані' })
  get(@Body() dto: GuestCartDto, @CurrentUser() user: JwtUser | null) {
    return this.cartService.getCart(user, dto.guestId);
  }

  @Post('add')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Додати товар до кошика',
    description:
      'Додає товар у кошик. Авторизація опціональна: авторизовані користувачі оновлюють свій кошик, гості — гостьовий кошик, ідентифікований guestId.',
  })
  @ApiResponse({ status: 201, description: 'Товар успішно додано до кошика' })
  @ApiResponse({ status: 400, description: 'Некоректні вхідні дані (наприклад, недостатньо товару на складі)' })
  @ApiResponse({ status: 404, description: 'Товар не знайдено' })
  add(@Body() dto: AddToCartDto, @CurrentUser() user: JwtUser | null) {
    return this.cartService.addItem(user, dto);
  }

  @Patch('qty')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Оновити кількість товару в кошику',
    description:
      'Встановлює нову кількість для товару в кошику. Авторизація опціональна: працює як для авторизованих користувачів, так і для гостей із guestId.',
  })
  @ApiResponse({ status: 200, description: 'Кількість успішно оновлено' })
  @ApiResponse({ status: 400, description: 'Некоректні вхідні дані' })
  @ApiResponse({ status: 404, description: 'Товар або кошик не знайдено' })
  qty(@Body() dto: UpdateCartQtyDto, @CurrentUser() user: JwtUser | null) {
    return this.cartService.updateQty(user, dto);
  }

  @Delete('remove')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Видалити товар з кошика',
    description:
      'Видаляє товар із кошика за productId. Авторизація опціональна: для гостей використовується guestId у query.',
  })
  @ApiResponse({ status: 200, description: 'Товар успішно видалено з кошика' })
  @ApiResponse({ status: 400, description: 'Некоректні вхідні дані' })
  @ApiResponse({ status: 404, description: 'Товар або кошик не знайдено' })
  remove(@Query() dto: RemoveFromCartDto, @CurrentUser() user: JwtUser | null) {
    return this.cartService.removeItem(user, dto.productId, dto.guestId);
  }
}
