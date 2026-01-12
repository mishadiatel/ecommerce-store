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

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post('translations')
  createTranslation(@Body() dto: CreateCategoryTranslationDto) {
    return this.categoryService.createTranslation(dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch('translations/:id')
  updateTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryTranslationDto,
  ) {
    return this.categoryService.updateTranslation(id, dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete('translations/:id')
  removeTranslation(@Param('id') id: string) {
    return this.categoryService.deleteTranslation(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query() query: BaseQueryDto) {
    return this.categoryService.findAllCategoriesAdmin(query);
  }

  @Get('public')
  findAllPublic() {
    return this.categoryService.findAllPublic();
  }

  @Get(':slug/public')
  findBySlugPublic(@Param('slug') slug: string) {
    return this.categoryService.findPublicCategoryBySlug(slug);
  }

  @Get(':id/publicById')
  findByIdPublic(@Param('id') id: string) {
    return this.categoryService.findPublicCategoryById(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findAdminCategoryById(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.updateCategory(id, dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
