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
import { MailTemplateService } from './mail-template.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMailTemplateDto } from './dto/create-mail-template.dto';
import { UpdateMailTemplateDto } from './dto/update-mail-template.dto';
import { BaseQueryDto } from '../utils/base-query.dto';

@ApiTags('Mail Templates')
@Controller('mail-template')
export class MailTemplateController {
  constructor(private readonly mailTemplateService: MailTemplateService) {}

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Створити шаблон листа',
    description: 'Створює новий шаблон електронного листа.',
  })
  @ApiResponse({ status: 201, description: 'Шаблон листа успішно створено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMailTemplateDto: CreateMailTemplateDto) {
    return this.mailTemplateService.create(createMailTemplateDto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати список шаблонів листів',
    description: 'Повертає всі шаблони листів для панелі адміністратора.',
  })
  @ApiResponse({ status: 200, description: 'Список шаблонів листів.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: BaseQueryDto) {
    return this.mailTemplateService.findAll(query);
  }

  @ApiOperation({
    summary: 'Отримати публічний шаблон листа за slug',
    description: 'Повертає публічний шаблон листа за його slug.',
  })
  @ApiParam({ name: 'slug', description: 'Slug шаблону листа' })
  @ApiResponse({ status: 200, description: 'Дані шаблону листа.' })
  @ApiResponse({ status: 404, description: 'Шаблон листа не знайдено.' })
  @Get('/getPublicMailTemplate/:slug')
  @HttpCode(HttpStatus.OK)
  findPublicMailTemplate(@Param('slug') slug: string) {
    return this.mailTemplateService.findPublicMailTemplate(slug);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати шаблон листа за ідентифікатором',
    description: 'Повертає деталі шаблону листа за його ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор шаблону листа (MongoID)',
  })
  @ApiResponse({ status: 200, description: 'Дані шаблону листа.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Шаблон листа не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.mailTemplateService.findOne(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити шаблон листа',
    description: 'Оновлює існуючий шаблон листа за його ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор шаблону листа (MongoID)',
  })
  @ApiResponse({ status: 200, description: 'Шаблон листа успішно оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Шаблон листа не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateMailTemplateDto: UpdateMailTemplateDto,
  ) {
    return this.mailTemplateService.update(id, updateMailTemplateDto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити шаблон листа',
    description: 'Видаляє шаблон листа за його ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор шаблону листа (MongoID)',
  })
  @ApiResponse({ status: 204, description: 'Шаблон листа успішно видалено.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Шаблон листа не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.mailTemplateService.remove(id);
  }
}
