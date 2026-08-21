import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { UpsertContactsDto } from './dto/upsert-contacts.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @ApiOperation({
    summary: 'Публічний контент блоку "Контакти" для мови',
    description:
      'Повертає контент блоку контактів для заданої мови сайту. Якщо запис відсутній — повертає порожню структуру.',
  })
  @ApiQuery({ name: 'language', required: false, example: 'ua' })
  @ApiResponse({ status: 200, description: 'Контент блоку контактів.' })
  @Get('public')
  @HttpCode(HttpStatus.OK)
  getPublic(@Query('language') language?: string) {
    return this.contactsService.findPublicByLanguage(
      language && language.trim() ? language.trim() : 'ua',
    );
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Усі мовні версії блоку контактів',
    description: 'Повертає масив документів (по одному на мову).',
  })
  @ApiResponse({ status: 200, description: 'Список.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.contactsService.findAll();
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Контакти для конкретної мови',
    description: 'Повертає документ контактів для заданої мови.',
  })
  @ApiParam({ name: 'language', description: 'Код мови', example: 'ua' })
  @ApiResponse({ status: 200, description: 'Документ.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':language')
  @HttpCode(HttpStatus.OK)
  findByLanguage(@Param('language') language: string) {
    return this.contactsService.findByLanguage(language);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Створити або оновити контент блоку контактів',
    description:
      'Upsert-операція: створює документ для мови, якщо відсутній, інакше оновлює.',
  })
  @ApiResponse({ status: 200, description: 'Створено/оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Put()
  @HttpCode(HttpStatus.OK)
  upsert(@Body() dto: UpsertContactsDto) {
    return this.contactsService.upsert(dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити контент для мови',
  })
  @ApiParam({ name: 'language', description: 'Код мови', example: 'ua' })
  @ApiResponse({ status: 204, description: 'Видалено.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':language')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('language') language: string) {
    return this.contactsService.remove(language);
  }
}
