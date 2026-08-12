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
import { CategoryService } from './category.service';
import {
  UpdateCategoryDto,
  UpdateCategoryTranslationDto,
} from './dto/update-category.dto';
import {
  CreateCategoryDto,
  CreateCategoryTranslationDto,
} from './dto/create-category.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BaseQueryDto } from '../utils/base-query.dto';

@ApiTags('Categories')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Створити категорію',
    description: 'Створює нову категорію товарів. Доступно лише адміністратору.',
  })
  @ApiResponse({ status: 201, description: 'Категорію успішно створено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Створити переклад категорії',
    description:
      'Створює локалізований переклад для існуючої категорії. Доступно лише адміністратору.',
  })
  @ApiResponse({ status: 201, description: 'Переклад категорії успішно створено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post('translations')
  createTranslation(@Body() dto: CreateCategoryTranslationDto) {
    return this.categoryService.createTranslation(dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити переклад категорії',
    description:
      'Оновлює локалізований переклад категорії за його ідентифікатором. Доступно лише адміністратору.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор перекладу категорії (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Переклад категорії оновлено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Переклад не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch('translations/:id')
  updateTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryTranslationDto,
  ) {
    return this.categoryService.updateTranslation(id, dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити переклад категорії',
    description:
      'Видаляє локалізований переклад категорії за його ідентифікатором. Доступно лише адміністратору.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор перекладу категорії (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Переклад категорії видалено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Переклад не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete('translations/:id')
  removeTranslation(@Param('id') id: string) {
    return this.categoryService.deleteTranslation(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати всі категорії (адмін)',
    description:
      'Повертає перелік усіх категорій (включно з прихованими) з підтримкою пагінації, сортування та фільтрації. Доступно лише адміністратору.',
  })
  @ApiResponse({ status: 200, description: 'Список категорій отримано' })
  @ApiResponse({ status: 400, description: 'Некоректні параметри запиту' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query() query: BaseQueryDto) {
    return this.categoryService.findAllCategoriesAdmin(query);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати всі категорії (адмін, без пагінації)',
    description:
      'Повертає повний перелік усіх категорій без пагінації для використання в адмін-панелі.',
  })
  @ApiResponse({ status: 200, description: 'Список категорій отримано' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get('allAdmin')
  findAllAdmin() {
    return this.categoryService.findAllAdminCategories();
  }

  @ApiOperation({
    summary: 'Отримати всі публічні категорії',
    description:
      'Повертає перелік видимих категорій для публічного каталогу.',
  })
  @ApiResponse({ status: 200, description: 'Список публічних категорій отримано' })
  @Get('public')
  findAllPublic() {
    return this.categoryService.findAllPublic();
  }

  @ApiOperation({
    summary: 'Отримати публічну категорію за slug',
    description: 'Повертає деталі видимої категорії за її slug.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Унікальний slug категорії',
    example: 'cakes',
  })
  @ApiResponse({ status: 200, description: 'Категорію знайдено' })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено' })
  @Get(':slug/public')
  findBySlugPublic(@Param('slug') slug: string) {
    return this.categoryService.findPublicCategoryBySlug(slug);
  }

  @ApiOperation({
    summary: 'Отримати публічну категорію за ID',
    description: 'Повертає деталі видимої категорії за її ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор категорії (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Категорію знайдено' })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено' })
  @Get(':id/publicById')
  findByIdPublic(@Param('id') id: string) {
    return this.categoryService.findPublicCategoryById(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати категорію за ID',
    description:
      'Повертає деталі категорії за її ідентифікатором (адмін-перегляд). Доступно лише адміністратору.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор категорії (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Категорію знайдено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findAdminCategoryById(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити категорію',
    description:
      'Оновлює основні дані категорії за її ідентифікатором. Доступно лише адміністратору.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор категорії (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Категорію оновлено' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.updateCategory(id, dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити категорію',
    description:
      'Видаляє категорію за її ідентифікатором. Доступно лише адміністратору.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор категорії (MongoID)',
    example: '65f0c3b1e2a1b2c3d4e5f6a7',
  })
  @ApiResponse({ status: 200, description: 'Категорію видалено' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адміністратор)' })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
