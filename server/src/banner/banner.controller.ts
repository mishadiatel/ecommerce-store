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
import { BannerService } from './banner.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import {
  CreateBannerTranslationDto,
  UpdateBannerTranslationDto,
} from './dto/banner-translation.dto';
import { GetBannersQueryDto } from './dto/get-banners-query.dto';

@Controller('banner')
export class BannerController {
  constructor(private readonly bannersService: BannerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBanner(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Post('translation')
  @HttpCode(HttpStatus.CREATED)
  addTranslation(@Body() dto: CreateBannerTranslationDto) {
    return this.bannersService.addTranslation(dto);
  }

  @Get()
  getAllPublic(@Query() query: GetBannersQueryDto) {
    return this.bannersService.getAllPublic(query);
  }

  @Get('admin')
  getAllAdmin(@Query() query: GetBannersQueryDto) {
    return this.bannersService.getAllAdmin(query);
  }

  @Patch(':id')
  updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Patch(':id/translation')
  updateTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateBannerTranslationDto,
  ) {
    return this.bannersService.updateTranslation(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBanner(@Param('id') id: string) {
    return this.bannersService.delete(id);
  }
}
