import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PopularQueryService } from './popular-query.service';
import { CreatePopularQueryDto } from './dto/create-popular-query.dto';
import { UpdatePopularQueryDto } from './dto/update-popular-query.dto';
import { PopularQueryQueryDto } from './dto/popular-query-query.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Popular Queries')
@Controller('popular-query')
export class PopularQueryController {
  constructor(private readonly popularQueryService: PopularQueryService) {}

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Створити популярний запит',
    description: 'Створює новий популярний пошуковий запит для мови.',
  })
  @ApiResponse({ status: 201, description: 'Створено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані або дубль.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePopularQueryDto) {
    return this.popularQueryService.create(dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Список популярних запитів',
    description:
      'Пагінований список з фільтрацією за мовою, статусом видимості та пошуком за текстом.',
  })
  @ApiResponse({ status: 200, description: 'Пагінований список.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: PopularQueryQueryDto) {
    return this.popularQueryService.findAll(query);
  }

  @ApiOperation({
    summary: 'Публічні популярні запити для мови',
    description:
      'Повертає лише видимі запити для заданої мови. Використовується в модальному вікні пошуку на сайті.',
  })
  @ApiQuery({
    name: 'language',
    description: 'Код мови сайту',
    example: 'ua',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Максимальна кількість запитів (1..100). За замовчуванням 20.',
    example: 20,
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Масив видимих запитів.' })
  @Get('public')
  @HttpCode(HttpStatus.OK)
  findPublic(
    @Query('language') language?: string,
    @Query('limit') limit?: string,
  ) {
    const lang = language && language.trim() ? language.trim() : 'ua';
    const parsedLimit = limit ? Number(limit) : 20;
    return this.popularQueryService.findPublicByLanguage(
      lang,
      Number.isFinite(parsedLimit) ? parsedLimit : 20,
    );
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати популярний запит за ID',
    description: 'Повертає деталі одного популярного запиту.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор (MongoID)' })
  @ApiResponse({ status: 200, description: 'Об\'єкт.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.popularQueryService.findOne(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити популярний запит',
    description: 'Оновлює текст запиту, мову або видимість.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор (MongoID)' })
  @ApiResponse({ status: 200, description: 'Оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані або дубль.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdatePopularQueryDto) {
    return this.popularQueryService.update(id, dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити популярний запит',
    description: 'Видаляє популярний запит за ідентифікатором.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор (MongoID)' })
  @ApiResponse({ status: 204, description: 'Видалено.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.popularQueryService.remove(id);
  }
}
