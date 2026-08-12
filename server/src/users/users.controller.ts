import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Створити користувача',
    description: 'Створює нового користувача у системі.',
  })
  @ApiResponse({ status: 201, description: 'Користувача успішно створено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані для створення користувача' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'Отримати список користувачів',
    description: 'Повертає список усіх користувачів системи.',
  })
  @ApiResponse({ status: 200, description: 'Список користувачів' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // ─── Admin ──────────────────────────────────────────────────────────

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Список користувачів з інфо про корзину і замовлення',
    description:
      'Пагінований список зареєстрованих користувачів з полями hasAbandonedCart, cartItemsCount, ordersCount, totalSpent. Можна фільтрувати за пошуковим запитом і за наявністю покинутої корзини.',
  })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '25' })
  @ApiQuery({ name: 'search', required: false, example: 'petrenko' })
  @ApiQuery({
    name: 'hasAbandonedCart',
    required: false,
    example: 'true',
    description: 'Якщо "true" — тільки користувачі з непорожньою корзиною.',
  })
  @ApiResponse({ status: 200, description: 'Пагінований список.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('hasAbandonedCart') hasAbandonedCart?: string,
  ) {
    return this.usersService.findAllAdmin({
      page,
      limit,
      search,
      hasAbandonedCart,
    });
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/:id/details')
  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Деталі користувача',
    description:
      'Профіль користувача + історія всіх замовлень + поточна корзина + сумарна статистика по замовленнях цього користувача.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор користувача',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Об\'єкт з деталями користувача.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено.' })
  findUserDetailsAdmin(@Param('id') id: string) {
    return this.usersService.findUserDetailsAdmin(id);
  }

  @ApiOperation({
    summary: 'Отримати користувача за ID',
    description: 'Повертає дані користувача за його ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор користувача',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Дані користувача' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Оновити користувача',
    description: 'Оновлює дані користувача за його ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор користувача',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Користувача успішно оновлено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані для оновлення' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: 'Видалити користувача',
    description: 'Видаляє користувача за його ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор користувача',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Користувача успішно видалено' })
  @ApiResponse({ status: 401, description: 'Користувач не авторизований' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
