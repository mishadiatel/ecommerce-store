import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { PromoCodeService } from './promo-code.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PromoCodeQueryDto } from './dto/promo-code-query.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CartService } from '../cart/cart.service';

@ApiTags('Promo Codes')
@Controller('promo-code')
export class PromoCodeController {
  constructor(
    private readonly promoCodeService: PromoCodeService,
    private readonly cartService: CartService,
  ) {}

  // ─── Публічний ендпоінт: активація/перевірка промокоду на checkout ───────

  @UseGuards(OptionalAuthGuard)
  @Post('validate')
  @ApiOperation({
    summary: 'Валідація промокоду на checkout',
    description:
      'Перевіряє існування, активність та застосовність промокоду до поточного кошика користувача або гостя. Повертає розрахований розмір знижки.',
  })
  @ApiResponse({ status: 201, description: 'Промокод валідний, знижка розрахована.' })
  @ApiResponse({
    status: 400,
    description: 'Промокод недійсний, неактивний, прострочений або не задовольняє мінімальну суму замовлення.',
  })
  @ApiResponse({ status: 404, description: 'Промокод не знайдено.' })
  async validate(
    @Body() dto: ValidatePromoCodeDto,
    @CurrentUser() user: JwtUser | null,
  ) {
    const cart = await this.cartService.getCart(user, dto.guestId);

    const { promoCode, discountAmount } =
      await this.promoCodeService.validateForCart(dto.code, cart.total ?? 0);

    return {
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      minOrderAmount: promoCode.minOrderAmount,
      discountAmount,
    };
  }

  // ─── Адмін CRUD ───────────────────────────────────────────────────────────

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Створити промокод',
    description: 'Створює новий промокод з відсотковою або фіксованою знижкою.',
  })
  @ApiResponse({ status: 201, description: 'Промокод створено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  create(@Body() dto: CreatePromoCodeDto) {
    return this.promoCodeService.create(dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Список промокодів',
    description: 'Повертає пагінований список промокодів з фільтрацією за статусом та пошуком.',
  })
  @ApiResponse({ status: 200, description: 'Список промокодів.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  findAll(@Query() query: PromoCodeQueryDto) {
    return this.promoCodeService.findAll(query);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати промокод за ID',
    description: 'Повертає промокод за ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор промокоду',
    example: '65f0b1a2c3d4e5f6a7b8c9d0',
  })
  @ApiResponse({ status: 200, description: 'Промокод знайдено.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Промокод не знайдено.' })
  findOne(@Param('id') id: string) {
    return this.promoCodeService.findById(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити промокод',
    description: 'Оновлює поля промокоду (код, тип, розмір знижки, дати дії тощо).',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор промокоду',
    example: '65f0b1a2c3d4e5f6a7b8c9d0',
  })
  @ApiResponse({ status: 200, description: 'Промокод оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Промокод не знайдено.' })
  update(@Param('id') id: string, @Body() dto: UpdatePromoCodeDto) {
    return this.promoCodeService.update(id, dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити промокод',
    description: 'Видаляє промокод за ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор промокоду',
    example: '65f0b1a2c3d4e5f6a7b8c9d0',
  })
  @ApiResponse({ status: 200, description: 'Промокод видалено.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Промокод не знайдено.' })
  remove(@Param('id') id: string) {
    return this.promoCodeService.remove(id);
  }
}
