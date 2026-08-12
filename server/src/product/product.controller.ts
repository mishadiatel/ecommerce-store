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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { BaseQueryDto } from '../utils/base-query.dto';
import {
  CreateProductDto,
  CreateProductTranslationDto,
} from './dto/create-product.dto';
import {
  UpdateProductDto,
  UpdateProductTranslationDto,
} from './dto/update-product.dto';

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Створити продукт',
    description: 'Створює новий продукт у каталозі. Доступно лише адміністратору.',
  })
  @ApiResponse({ status: 201, description: 'Продукт успішно створено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Створити переклад продукту',
    description:
      'Створює локалізований переклад для існуючого продукту. Доступно лише адміністратору.',
  })
  @ApiResponse({ status: 201, description: 'Переклад продукту успішно створено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Продукт не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post('translations')
  createTranslation(@Body() dto: CreateProductTranslationDto) {
    return this.productService.createTranslation(dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити переклад продукту',
    description:
      'Оновлює локалізований переклад продукту за його ідентифікатором. Доступно лише адміністратору.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор перекладу продукту (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Переклад продукту оновлено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Переклад не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch('translations/:id')
  updateTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateProductTranslationDto,
  ) {
    return this.productService.updateTranslation(id, dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити переклад продукту',
    description:
      'Видаляє локалізований переклад продукту за його ідентифікатором. Доступно лише адміністратору.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор перекладу продукту (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Переклад продукту видалено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Переклад не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete('translations/:id')
  removeTranslation(@Param('id') id: string) {
    return this.productService.deleteTranslation(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати всі продукти (адмін)',
    description:
      'Повертає перелік усіх продуктів (включно з прихованими) з підтримкою пагінації, сортування та фільтрації. Доступно лише адміністратору.',
  })
  @ApiResponse({ status: 200, description: 'Список продуктів отримано' })
  @ApiResponse({ status: 400, description: 'Некоректні параметри запиту' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query() query: BaseQueryDto) {
    return this.productService.findAllProductsAdmin(query);
  }

  // @UseGuards(AccessTokenGuard, RolesGuard)
  // @Roles('admin')
  // @Get('allAdmin')
  // findAllAdmin() {
  //   return this.categoryService.findAllAdminCategories();
  // }

  @ApiOperation({
    summary: 'Отримати всі публічні продукти',
    description:
      'Повертає перелік видимих продуктів для публічного каталогу з підтримкою пагінації, сортування та фільтрації.',
  })
  @ApiResponse({ status: 200, description: 'Список публічних продуктів отримано' })
  @ApiResponse({ status: 400, description: 'Некоректні параметри запиту' })
  @Get('public')
  findAllPublic(@Query() query: BaseQueryDto) {
    return this.productService.findAllPublic(query);
  }

  @ApiOperation({
    summary: 'Отримати публічні продукти за масивом ID',
    description:
      'Повертає перелік видимих продуктів за списком їх ідентифікаторів.',
  })
  @ApiResponse({ status: 200, description: 'Список продуктів отримано' })
  @ApiResponse({ status: 400, description: 'Некоректні параметри запиту' })
  @Get('publicByIdsArray')
  findByIdsArrayPublic(@Query('ids') ids: string | string[]) {
    const normalizedIds = Array.isArray(ids) ? ids : [ids];
    return this.productService.findPublicProductsByIdsArray(normalizedIds);
  }

  @ApiOperation({
    summary: 'Отримати публічні продукти за масивом slug',
    description:
      'Повертає перелік видимих продуктів за списком їх slug.',
  })
  @ApiResponse({ status: 200, description: 'Список продуктів отримано' })
  @ApiResponse({ status: 400, description: 'Некоректні параметри запиту' })
  @Get('publicBySlugsArray')
  findBySlugsArrayPublic(@Query('slugs') slugs: string | string[]) {
    const normalizedSlugs = Array.isArray(slugs) ? slugs : [slugs];
    return this.productService.findPublicProductsBySlugsArray(normalizedSlugs);
  }

  @ApiOperation({
    summary: 'Отримати публічний продукт за slug',
    description: 'Повертає деталі видимого продукту за його slug.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Унікальний slug продукту',
    example: 'chocolate-cake',
  })
  @ApiResponse({ status: 200, description: 'Продукт знайдено' })
  @ApiResponse({ status: 404, description: 'Продукт не знайдено' })
  @Get(':slug/public')
  findBySlugPublic(@Param('slug') slug: string) {
    return this.productService.findPublicProductBySlug(slug);
  }

  @ApiOperation({
    summary: 'Отримати публічний продукт за ID',
    description: 'Повертає деталі видимого продукту за його ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор продукту (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Продукт знайдено' })
  @ApiResponse({ status: 404, description: 'Продукт не знайдено' })
  @Get(':id/publicById')
  findByIdPublic(@Param('id') id: string) {
    return this.productService.findPublicProductById(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати продукт за ID',
    description:
      'Повертає деталі продукту за його ідентифікатором (адмін-перегляд). Доступно лише адміністратору.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор продукту (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Продукт знайдено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Продукт не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findAdminProductById(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити продукт',
    description:
      'Оновлює основні дані продукту за його ідентифікатором. Доступно лише адміністратору.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор продукту (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Продукт оновлено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Продукт не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити продукт',
    description:
      'Видаляє продукт за його ідентифікатором. Доступно лише адміністратору.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор продукту (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Продукт видалено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Продукт не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
