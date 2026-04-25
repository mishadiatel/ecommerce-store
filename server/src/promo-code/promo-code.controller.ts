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

@Controller('promo-code')
export class PromoCodeController {
  constructor(
    private readonly promoCodeService: PromoCodeService,
    private readonly cartService: CartService,
  ) {}

  // ─── Публічний ендпоінт: активація/перевірка промокоду на checkout ───────

  @UseGuards(OptionalAuthGuard)
  @Post('validate')
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
  create(@Body() dto: CreatePromoCodeDto) {
    return this.promoCodeService.create(dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query() query: PromoCodeQueryDto) {
    return this.promoCodeService.findAll(query);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promoCodeService.findById(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePromoCodeDto) {
    return this.promoCodeService.update(id, dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promoCodeService.remove(id);
  }
}
