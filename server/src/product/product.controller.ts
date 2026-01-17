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

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post('translations')
  createTranslation(@Body() dto: CreateProductTranslationDto) {
    return this.productService.createTranslation(dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch('translations/:id')
  updateTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateProductTranslationDto,
  ) {
    return this.productService.updateTranslation(id, dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete('translations/:id')
  removeTranslation(@Param('id') id: string) {
    return this.productService.deleteTranslation(id);
  }

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

  @Get('public')
  findAllPublic(@Query() query: BaseQueryDto) {
    return this.productService.findAllPublic(query);
  }

  @Get(':slug/public')
  findBySlugPublic(@Param('slug') slug: string) {
    return this.productService.findPublicProductBySlug(slug);
  }

  @Get(':id/publicById')
  findByIdPublic(@Param('id') id: string) {
    return this.productService.findPublicProductById(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findAdminProductById(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
