import {
  Body,
  Controller,
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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  OrderStatsQueryDto,
  OrderTimelineQueryDto,
  TopProductsQueryDto,
} from './dto/order-stats-query.dto';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(OptionalAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Створити замовлення',
    description:
      'Створює нове замовлення на основі поточного кошика. Працює як для авторизованих користувачів, так і для гостей (за наявності guestId).',
  })
  @ApiResponse({ status: 201, description: 'Замовлення успішно створене.' })
  @ApiResponse({
    status: 400,
    description: 'Некоректні дані або порожній кошик.',
  })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtUser | null) {
    return this.orderService.createOrder(user, dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Список усіх замовлень',
    description:
      'Повертає пагінований список усіх замовлень з фільтрацією за статусом, оплатою, датами та пошуком.',
  })
  @ApiResponse({ status: 200, description: 'Список замовлень.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  findAllAdmin(@Query() query: OrderQueryDto) {
    return this.orderService.findAllOrdersAdmin(query);
  }

  @UseGuards(AccessTokenGuard)
  @Get('my')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Мої замовлення',
    description: 'Повертає пагінований список замовлень поточного користувача.',
  })
  @ApiResponse({ status: 200, description: 'Список замовлень користувача.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  findMyOrders(@CurrentUser() user: JwtUser, @Query() query: OrderQueryDto) {
    return this.orderService.findMyOrders(String(user.sub), query);
  }

  @UseGuards(AccessTokenGuard)
  @Get('my/:id')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Моє замовлення за ID',
    description: 'Повертає замовлення поточного користувача за ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор замовлення',
    example: '65f0b1a2c3d4e5f6a7b8c9d0',
  })
  @ApiResponse({ status: 200, description: 'Замовлення знайдене.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 404, description: 'Замовлення не знайдене.' })
  findMyOrder(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.orderService.findMyOrderById(String(user.sub), id);
  }

  // ─── Статистика (admin) ────────────────────────────────────────────────

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get('stats/summary')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Загальна статистика замовлень',
    description:
      'Повертає загальні показники за період: кількість замовлень, виручка, середній чек, розбивка за статусами замовлення/оплати, співвідношення гість/зареєстрований користувач.',
  })
  @ApiResponse({ status: 200, description: 'Об\'єкт зі статистикою.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  getStatsSummary(@Query() query: OrderStatsQueryDto) {
    return this.orderService.getStatsSummary(query.dateFrom, query.dateTo);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get('stats/top-products')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Топ-товарів за період',
    description:
      'Топ-N товарів за виручкою або кількістю проданих одиниць у заданому діапазоні дат.',
  })
  @ApiResponse({ status: 200, description: 'Список топ-товарів.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  getTopProducts(@Query() query: TopProductsQueryDto) {
    return this.orderService.getTopProducts(
      query.dateFrom,
      query.dateTo,
      query.limit ?? 10,
      query.sortBy === 'quantity' ? 'quantity' : 'revenue',
    );
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get('stats/timeline')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Часовий ряд замовлень',
    description:
      'Часовий ряд для графіків: кількість замовлень, виручка та кількість проданих одиниць по днях / тижнях / місяцях.',
  })
  @ApiResponse({ status: 200, description: 'Масив точок часового ряду.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  getOrdersTimeline(@Query() query: OrderTimelineQueryDto) {
    const g = query.granularity;
    const granularity: 'day' | 'week' | 'month' =
      g === 'week' || g === 'month' ? g : 'day';
    return this.orderService.getOrdersTimeline(
      query.dateFrom,
      query.dateTo,
      granularity,
    );
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати замовлення за ID',
    description: 'Повертає повну інформацію про замовлення за ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор замовлення',
    example: '65f0b1a2c3d4e5f6a7b8c9d0',
  })
  @ApiResponse({ status: 200, description: 'Замовлення знайдене.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Замовлення не знайдене.' })
  findOneAdmin(@Param('id') id: string) {
    return this.orderService.findOrderById(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити статус замовлення',
    description: 'Змінює статус замовлення (pending, processing, shipped, delivered, completed, cancelled).',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор замовлення',
    example: '65f0b1a2c3d4e5f6a7b8c9d0',
  })
  @ApiResponse({ status: 200, description: 'Статус замовлення оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректний статус.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Замовлення не знайдене.' })
  updateStatusAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto.status);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/mark-paid')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Позначити замовлення як оплачене',
    description: 'Встановлює статус оплати замовлення в "paid" (наприклад, для ручного підтвердження оплати).',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор замовлення',
    example: '65f0b1a2c3d4e5f6a7b8c9d0',
  })
  @ApiResponse({
    status: 200,
    description: 'Замовлення позначене як оплачене.',
  })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Замовлення не знайдене.' })
  markAsPaidAdmin(@Param('id') id: string) {
    return this.orderService.markAsPaid(id);
  }
}
