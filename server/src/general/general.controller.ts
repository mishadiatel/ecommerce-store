import {
  Controller,
  Get,
  Body,
  Patch,
  HttpStatus,
  HttpCode,
  Post,
  Param,
  Delete,
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
import { GeneralService } from './general.service';
import { UpdateGeneralDto } from './dto/update-general.dto';
import { CreateSettingsTranslationDto } from './dto/create-settings-translation.dto';
import { UpdateSettingsTranslationDto } from './dto/update-settings-translation.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('General Settings')
@Controller('general-settings')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати загальні налаштування',
    description: 'Повертає загальні налаштування магазину для адміністратора.',
  })
  @ApiResponse({ status: 200, description: 'Загальні налаштування.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  getSettings() {
    return this.generalService.getSettings();
  }

  @ApiOperation({
    summary: 'Отримати публічні налаштування з перекладами',
    description:
      'Повертає загальні налаштування магазину разом з активними перекладами.',
  })
  @ApiResponse({
    status: 200,
    description: 'Публічні налаштування з перекладами.',
  })
  @Get('/public')
  @HttpCode(HttpStatus.OK)
  getPublicSettingsWithTranslation() {
    return this.generalService.getPublicSettingsWithTranslation();
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити загальні налаштування',
    description: 'Оновлює загальні налаштування магазину.',
  })
  @ApiResponse({ status: 200, description: 'Налаштування успішно оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch()
  @HttpCode(HttpStatus.OK)
  update(@Body() updateDto: UpdateGeneralDto) {
    return this.generalService.update(updateDto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Створити переклад налаштувань',
    description: 'Створює новий переклад загальних налаштувань для мови.',
  })
  @ApiResponse({ status: 201, description: 'Переклад успішно створено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post('/translation')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSettingsTranslationDto) {
    return this.generalService.createSettingsTranslation(dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати всі переклади налаштувань',
    description:
      'Повертає список усіх перекладів загальних налаштувань магазину.',
  })
  @ApiResponse({ status: 200, description: 'Список перекладів налаштувань.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get('/translation')
  @HttpCode(HttpStatus.OK)
  getTranslations() {
    return this.generalService.findAllSettingsTranslations();
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Отримати переклад налаштувань за ідентифікатором',
    description: 'Повертає конкретний переклад загальних налаштувань.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор перекладу налаштувань (MongoID)',
  })
  @ApiResponse({ status: 200, description: 'Дані перекладу налаштувань.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Переклад не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get('/translation/:id')
  @HttpCode(HttpStatus.OK)
  getOneTranslation(@Param('id') id: string) {
    return this.generalService.findOneSettingsTranslation(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Оновити переклад налаштувань',
    description: 'Оновлює існуючий переклад загальних налаштувань.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор перекладу налаштувань (MongoID)',
  })
  @ApiResponse({ status: 200, description: 'Переклад успішно оновлено.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані запиту.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Переклад не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch('/translation/:id')
  @HttpCode(HttpStatus.OK)
  updateTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateSettingsTranslationDto,
  ) {
    return this.generalService.updateSettingsTranslation(id, dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити переклад налаштувань',
    description: 'Видаляє переклад загальних налаштувань за ідентифікатором.',
  })
  @ApiParam({
    name: 'id',
    description: 'Ідентифікатор перекладу налаштувань (MongoID)',
  })
  @ApiResponse({ status: 204, description: 'Переклад успішно видалено.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав доступу.' })
  @ApiResponse({ status: 404, description: 'Переклад не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete('/translation/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTranslation(@Param('id') id: string) {
    return this.generalService.removeSettingsTranslation(id);
  }
}
