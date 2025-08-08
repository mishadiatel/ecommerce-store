import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  createFaq(@Body() dto: CreateFaqDto) {
    return this.faqService.createFaq(dto);
  }

  @Patch(':id')
  updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.faqService.updateFaq(id, dto);
  }

  @Post('translation')
  createFaqTranslation(@Body() dto: CreateFaqTranslationDto) {
    return this.faqService.createFaqTranslation(dto);
  }

  @Patch('translation/:id')
  updateFaqTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateFaqTranslationDto,
  ) {
    return this.faqService.updateFaqTranslation(id, dto);
  }

  @Post('category')
  createCategory(@Body() dto: CreateFaqCategoryDto) {
    return this.faqService.createCategory(dto);
  }

  @Patch('category/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateFaqCategoryDto) {
    return this.faqService.updateCategory(id, dto);
  }

  @Post('category/translation')
  createCategoryTranslation(@Body() dto: CreateFaqCategoryTranslationDto) {
    return this.faqService.createCategoryTranslation(dto);
  }

  @Patch('category/translation/:id')
  updateCategoryTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateFaqCategoryTranslationDto,
  ) {
    return this.faqService.updateCategoryTranslation(id, dto);
  }

  @Get('admin')
  getAllFaqsAdmin(@Query() query: GetFaqQueryDto) {
    return this.faqService.getAllFaqsAdmin(query);
  }

  @Get()
  getAllFaqsPublic(@Query() query: GetFaqQueryDto) {
    return this.faqService.getAllFaqsPublic(query);
  }

  @Get('categories/admin')
  getAllCategoriesAdmin(@Query() query: GetFaqQueryDto) {
    return this.faqService.getAllCategoriesAdmin(query);
  }

  @Get('categories')
  getAllCategoriesPublic(@Query() query: GetFaqQueryDto) {
    return this.faqService.getAllCategoriesPublic(query);
  }

  @Get('by-category/:categoryId')
  getFaqsByCategory(
    @Param('categoryId') categoryId: string,
    @Query() query: GetFaqQueryDto,
  ) {
    return this.faqService.getFaqsByCategory(categoryId, query);
  }
}
