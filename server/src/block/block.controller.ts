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
import { BlockService } from './block.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BaseQueryDto } from '../utils/base-query.dto';

@ApiTags('Blocks')
@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Створити блок',
    description: 'Створює новий блок контенту для сторінок сайту.',
  })
  @ApiResponse({ status: 201, description: 'Блок успішно створено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBlockDto) {
    return this.blockService.create(dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати список блоків',
    description: 'Повертає список усіх блоків контенту для адміністратора.',
  })
  @ApiResponse({ status: 200, description: 'Список блоків.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: BaseQueryDto) {
    return this.blockService.findAll(query);
  }

  @ApiOperation({
    summary: 'Отримати публічні блоки за сторінкою',
    description:
      'Повертає видимі блоки контенту для конкретної публічної сторінки.',
  })
  @ApiParam({ name: 'page', description: 'Ідентифікатор або slug сторінки' })
  @ApiResponse({ status: 200, description: 'Список публічних блоків.' })
  @ApiResponse({ status: 404, description: 'Сторінку не знайдено.' })
  @Get('/public/:page')
  @HttpCode(HttpStatus.OK)
  findPublicBlocks(@Param('page') page: string, @Query() query: BaseQueryDto) {
    return this.blockService.findPublicBlocks(page, query);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати блок за ідентифікатором',
    description: 'Повертає деталі блоку за його ідентифікатором.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор блока (MongoID)' })
  @ApiResponse({ status: 200, description: 'Дані блока.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Блок не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.blockService.findOne(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити блок',
    description: 'Оновлює існуючий блок контенту за його ідентифікатором.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор блока (MongoID)' })
  @ApiResponse({ status: 200, description: 'Блок успішно оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Блок не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdateBlockDto) {
    return this.blockService.update(id, dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити блок',
    description: 'Видаляє блок контенту за його ідентифікатором.',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор блока (MongoID)' })
  @ApiResponse({ status: 204, description: 'Блок успішно видалено.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Блок не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.blockService.remove(id);
  }
}
