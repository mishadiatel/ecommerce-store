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
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BannerService } from './banner.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import {
  CreateBannerTranslationDto,
  UpdateBannerTranslationDto,
} from './dto/banner-translation.dto';
import { GetBannersQueryDto } from './dto/get-banners-query.dto';

@ApiTags('Banners')
@Controller('banner')
export class BannerController {
  constructor(private readonly bannersService: BannerService) {}

  @ApiOperation({
    summary: 'Створити банер',
    description: 'Створює новий банер у системі.',
  })
  @ApiResponse({ status: 201, description: 'Банер успішно створено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBanner(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @ApiOperation({
    summary: 'Додати переклад банера',
    description: 'Додає новий переклад для існуючого банера.',
  })
  @ApiResponse({ status: 201, description: 'Переклад банера успішно додано.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 404, description: 'Банер не знайдено.' })
  @Post('translation')
  @HttpCode(HttpStatus.CREATED)
  addTranslation(@Body() dto: CreateBannerTranslationDto) {
    return this.bannersService.addTranslation(dto);
  }

  @ApiOperation({
    summary: 'Отримати публічні банери',
    description: 'Повертає список активних банерів для публічного відображення.',
  })
  @ApiResponse({ status: 200, description: 'Список публічних банерів.' })
  @ApiResponse({ status: 400, description: 'Некоректні параметри запиту.' })
  @Get()
  getAllPublic(@Query() query: GetBannersQueryDto) {
    return this.bannersService.getAllPublic(query);
  }

  @ApiOperation({
    summary: 'Отримати банери для адміністратора',
    description: 'Повертає повний список банерів для панелі адміністратора.',
  })
  @ApiResponse({ status: 200, description: 'Список банерів для адміна.' })
  @ApiResponse({ status: 400, description: 'Некоректні параметри запиту.' })
  @Get('admin')
  getAllAdmin(@Query() query: GetBannersQueryDto) {
    return this.bannersService.getAllAdmin(query);
  }

  @ApiOperation({
    summary: 'Оновити банер',
    description: 'Оновлює дані існуючого банера за його ідентифікатором.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор банера (MongoID)' })
  @ApiResponse({ status: 200, description: 'Банер успішно оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 404, description: 'Банер не знайдено.' })
  @Patch(':id')
  updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Оновити переклад банера',
    description: 'Оновлює існуючий переклад банера за його ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор перекладу банера (MongoID)',
  })
  @ApiResponse({ status: 200, description: 'Переклад банера успішно оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 404, description: 'Переклад не знайдено.' })
  @Patch(':id/translation')
  updateTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateBannerTranslationDto,
  ) {
    return this.bannersService.updateTranslation(id, dto);
  }

  @ApiOperation({
    summary: 'Видалити банер',
    description: 'Видаляє банер із системи за його ідентифікатором.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор банера (MongoID)' })
  @ApiResponse({ status: 204, description: 'Банер успішно видалено.' })
  @ApiResponse({ status: 404, description: 'Банер не знайдено.' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBanner(@Param('id') id: string) {
    return this.bannersService.delete(id);
  }
}
