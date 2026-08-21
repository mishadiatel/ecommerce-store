import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubscribersService } from './subscribers.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { SubscribersQueryDto } from './dto/subscribers-query.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(
    private readonly subscribersService: SubscribersService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Підписатися на розсилку',
    description:
      'Публічний ендпоінт для форми в футері сайту. Ідемпотентний: якщо email вже є і був відписаний — активує його знову.',
  })
  @ApiResponse({ status: 201, description: 'Створено або активовано.' })
  @ApiResponse({ status: 400, description: 'Некоректний email.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  subscribe(@Body() dto: SubscribeDto) {
    return this.subscribersService.subscribe(dto);
  }

  @ApiOperation({
    summary: 'Відписатися від розсилки (one-click)',
    description:
      'Ендпоінт для one-click unsubscribe з листа. Робить редірект на головну сторінку з ?unsubscribed=1.',
  })
  @ApiParam({ name: 'token', description: 'Токен відписки', example: 'abcd...ef' })
  @ApiResponse({ status: 302, description: 'Редірект на сайт з прапорцем відписки.' })
  @ApiResponse({ status: 404, description: 'Токен не знайдено.' })
  @Get('unsubscribe/:token')
  async unsubscribeByToken(
    @Param('token') token: string,
    @Res() response: Response,
  ) {
    const appUrl =
      this.configService.get<string>('APP_PUBLIC_URL') ??
      process.env.APP_PUBLIC_URL ??
      '';
    const baseUrl = appUrl.replace(/\/+$/, '');
    try {
      await this.subscribersService.unsubscribeByToken(token);
      return response.redirect(`${baseUrl}/unsubscribed?ok=1`);
    } catch {
      return response.redirect(`${baseUrl}/unsubscribed?ok=0`);
    }
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Список підписників',
    description: 'Пагінований список з пошуком за email і фільтром активності.',
  })
  @ApiResponse({ status: 200, description: 'Список.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: SubscribersQueryDto) {
    return this.subscribersService.findAllAdmin(query);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити підписника',
  })
  @ApiParam({ name: 'id', description: 'ID підписника (MongoID)' })
  @ApiResponse({ status: 204, description: 'Видалено.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.subscribersService.remove(id);
  }
}
