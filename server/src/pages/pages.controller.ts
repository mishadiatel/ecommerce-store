import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
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
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BaseQueryDto } from '../utils/base-query.dto';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Створити сторінку',
    description: 'Створює нову сторінку сайту з метаданими SEO.',
  })
  @ApiResponse({ status: 201, description: 'Сторінку успішно створено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати список сторінок',
    description: 'Повертає всі сторінки сайту для панелі адміністратора.',
  })
  @ApiResponse({ status: 200, description: 'Список сторінок.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: BaseQueryDto) {
    return this.pagesService.findAll(query);
  }

  @ApiOperation({
    summary: 'Отримати публічну сторінку за slug',
    description: 'Повертає дані публічної сторінки за її slug.',
  })
  @ApiParam({ name: 'slug', description: 'Slug сторінки' })
  @ApiResponse({ status: 200, description: 'Дані публічної сторінки.' })
  @ApiResponse({ status: 404, description: 'Сторінку не знайдено.' })
  @Get('/getPublicPage/:slug')
  @HttpCode(HttpStatus.OK)
  findPublicPage(@Param('slug') slug: string) {
    return this.pagesService.findPublicPage(slug);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати сторінку за ідентифікатором',
    description: 'Повертає деталі сторінки за її ідентифікатором.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор сторінки (MongoID)' })
  @ApiResponse({ status: 200, description: 'Дані сторінки.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Сторінку не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити сторінку',
    description: 'Оновлює існуючу сторінку за її ідентифікатором.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор сторінки (MongoID)' })
  @ApiResponse({ status: 200, description: 'Сторінку успішно оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Сторінку не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, updatePageDto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити сторінку',
    description: 'Видаляє сторінку за її ідентифікатором.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор сторінки (MongoID)' })
  @ApiResponse({ status: 204, description: 'Сторінку успішно видалено.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Сторінку не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
