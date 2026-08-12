import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { CreateFaqTranslationDto } from './dto/create-faq-translation.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { UpdateFaqTranslationDto } from './dto/update-faq-translation.dto';
import { CreateFaqCategoryDto } from './dto/create-faq-category.dto';
import { UpdateFaqCategoryDto } from './dto/update-faq-category.dto';
import { CreateFaqCategoryTranslationDto } from './dto/create-faq-category-translation.dto';
import { UpdateFaqCategoryTranslationDto } from './dto/update-faq-category-translation.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { GetFaqQueryDto } from './dto/get-faq-query.dto';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @ApiOperation({
    summary: 'Створити FAQ',
    description: 'Створює нове запитання FAQ у обраній категорії.',
  })
  @ApiResponse({ status: 201, description: 'FAQ успішно створено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @Post()
  createFaq(@Body() dto: CreateFaqDto) {
    return this.faqService.createFaq(dto);
  }

  @ApiOperation({
    summary: 'Оновити FAQ',
    description: 'Оновлює запитання FAQ за його ідентифікатором.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор FAQ (MongoID)' })
  @ApiResponse({ status: 200, description: 'FAQ успішно оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 404, description: 'FAQ не знайдено.' })
  @Patch(':id')
  updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.faqService.updateFaq(id, dto);
  }

  @ApiOperation({
    summary: 'Створити переклад FAQ',
    description: 'Додає новий переклад для існуючого запитання FAQ.',
  })
  @ApiResponse({ status: 201, description: 'Переклад FAQ успішно створено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 404, description: 'FAQ не знайдено.' })
  @Post('translation')
  createFaqTranslation(@Body() dto: CreateFaqTranslationDto) {
    return this.faqService.createFaqTranslation(dto);
  }

  @ApiOperation({
    summary: 'Оновити переклад FAQ',
    description: 'Оновлює існуючий переклад FAQ за його ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор перекладу FAQ (MongoID)',
  })
  @ApiResponse({ status: 200, description: 'Переклад FAQ успішно оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 404, description: 'Переклад не знайдено.' })
  @Patch('translation/:id')
  updateFaqTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateFaqTranslationDto,
  ) {
    return this.faqService.updateFaqTranslation(id, dto);
  }

  @ApiOperation({
    summary: 'Створити категорію FAQ',
    description: 'Створює нову категорію для згрупування питань FAQ.',
  })
  @ApiResponse({ status: 201, description: 'Категорію FAQ успішно створено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @Post('category')
  createCategory(@Body() dto: CreateFaqCategoryDto) {
    return this.faqService.createCategory(dto);
  }

  @ApiOperation({
    summary: 'Оновити категорію FAQ',
    description: 'Оновлює існуючу категорію FAQ за її ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор категорії FAQ (MongoID)',
  })
  @ApiResponse({ status: 200, description: 'Категорію FAQ успішно оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено.' })
  @Patch('category/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateFaqCategoryDto) {
    return this.faqService.updateCategory(id, dto);
  }

  @ApiOperation({
    summary: 'Створити переклад категорії FAQ',
    description: 'Додає новий переклад для існуючої категорії FAQ.',
  })
  @ApiResponse({
    status: 201,
    description: 'Переклад категорії успішно створено.',
  })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено.' })
  @Post('category/translation')
  createCategoryTranslation(@Body() dto: CreateFaqCategoryTranslationDto) {
    return this.faqService.createCategoryTranslation(dto);
  }

  @ApiOperation({
    summary: 'Оновити переклад категорії FAQ',
    description: 'Оновлює існуючий переклад категорії FAQ.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор перекладу категорії (MongoID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Переклад категорії успішно оновлено.',
  })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 404, description: 'Переклад не знайдено.' })
  @Patch('category/translation/:id')
  updateCategoryTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateFaqCategoryTranslationDto,
  ) {
    return this.faqService.updateCategoryTranslation(id, dto);
  }

  @ApiOperation({
    summary: 'Отримати всі FAQ для адміністратора',
    description: 'Повертає повний список FAQ для панелі адміністратора.',
  })
  @ApiResponse({ status: 200, description: 'Список FAQ для адміністратора.' })
  @Get('admin')
  getAllFaqsAdmin(@Query() query: GetFaqQueryDto) {
    return this.faqService.getAllFaqsAdmin(query);
  }

  @ApiOperation({
    summary: 'Отримати всі публічні FAQ',
    description: 'Повертає список видимих FAQ для публічного відображення.',
  })
  @ApiResponse({ status: 200, description: 'Список публічних FAQ.' })
  @Get()
  getAllFaqsPublic(@Query() query: GetFaqQueryDto) {
    return this.faqService.getAllFaqsPublic(query);
  }

  @ApiOperation({
    summary: 'Отримати всі категорії FAQ для адміністратора',
    description: 'Повертає повний список категорій FAQ для адміністратора.',
  })
  @ApiResponse({ status: 200, description: 'Список категорій FAQ.' })
  @Get('categories/admin')
  getAllCategoriesAdmin(@Query() query: GetFaqQueryDto) {
    return this.faqService.getAllCategoriesAdmin(query);
  }

  @ApiOperation({
    summary: 'Отримати всі публічні категорії FAQ',
    description: 'Повертає список видимих категорій FAQ.',
  })
  @ApiResponse({ status: 200, description: 'Список публічних категорій FAQ.' })
  @Get('categories')
  getAllCategoriesPublic(@Query() query: GetFaqQueryDto) {
    return this.faqService.getAllCategoriesPublic(query);
  }

  @ApiOperation({
    summary: 'Отримати FAQ за категорією',
    description: 'Повертає список FAQ, що належать до вказаної категорії.',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Ідентифікатор категорії FAQ (MongoID)',
  })
  @ApiResponse({ status: 200, description: 'Список FAQ у категорії.' })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено.' })
  @Get('by-category/:categoryId')
  getFaqsByCategory(
    @Param('categoryId') categoryId: string,
    @Query() query: GetFaqQueryDto,
  ) {
    return this.faqService.getFaqsByCategory(categoryId, query);
  }
}
