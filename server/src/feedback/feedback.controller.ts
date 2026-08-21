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
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackQueryDto } from './dto/feedback-query.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @ApiOperation({
    summary: 'Створити заявку з форми',
    description:
      'Публічний ендпоінт для форм зворотного зв\'язку. Тип задається клієнтом (наприклад "contacts"). Після створення надсилає нотифікацію у Telegram.',
  })
  @ApiResponse({ status: 201, description: 'Заявка створена.' })
  @ApiResponse({ status: 400, description: 'Некоректні дані.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Список заявок',
    description:
      'Пагінований список з фільтром за типом, статусом прочитання та пошуком.',
  })
  @ApiResponse({ status: 200, description: 'Список.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: FeedbackQueryDto) {
    return this.feedbackService.findAll(query);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Позначити заявку прочитаною/непрочитаною',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор заявки (MongoID)' })
  @ApiResponse({ status: 200, description: 'Оновлено.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Param('id') id: string, @Body('isRead') isRead?: boolean) {
    return this.feedbackService.markAsRead(id, isRead ?? true);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Видалити заявку',
  })
  @ApiParam({ name: 'id', description: 'Ідентифікатор заявки (MongoID)' })
  @ApiResponse({ status: 204, description: 'Видалено.' })
  @ApiResponse({ status: 401, description: 'Не авторизовано.' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено (не адмін).' })
  @ApiResponse({ status: 404, description: 'Не знайдено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
