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
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { TestSendDto } from './dto/test-send.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BaseQueryDto } from '../utils/base-query.dto';

@ApiTags('Campaigns')
@ApiCookieAuth('accessToken')
@ApiBearerAuth('accessToken')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles('admin')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @ApiOperation({
    summary: '[admin] Створити чернетку розсилки',
    description:
      'Створює чернетку з темою та HTML. Використовуйте `{{unsubscribeUrl}}` у HTML щоб вставити персональне посилання відписки.',
  })
  @ApiResponse({ status: 201, description: 'Створено.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  @ApiOperation({
    summary: '[admin] Історія розсилок',
    description: 'Пагінований список кампаній (чернетки, надіслані, невдалі).',
  })
  @ApiResponse({ status: 200, description: 'Список.' })
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: BaseQueryDto) {
    return this.campaignsService.findAll(query);
  }

  @ApiOperation({ summary: '[admin] Отримати розсилку за ID' })
  @ApiParam({ name: 'id', description: 'ID розсилки (MongoID)' })
  @ApiResponse({ status: 200, description: 'Об\'єкт.' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @ApiOperation({
    summary: '[admin] Оновити чернетку',
    description: 'Не можна редагувати кампанію, яка вже надсилається.',
  })
  @ApiParam({ name: 'id', description: 'ID розсилки (MongoID)' })
  @ApiResponse({ status: 200, description: 'Оновлено.' })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignsService.update(id, dto);
  }

  @ApiOperation({
    summary: '[admin] Тестова відправка',
    description: 'Надсилає лист на вказаний email — щоб побачити, як виглядає у поштовику.',
  })
  @ApiParam({ name: 'id', description: 'ID розсилки (MongoID)' })
  @ApiResponse({ status: 200, description: 'Лист надіслано.' })
  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  testSend(@Param('id') id: string, @Body() dto: TestSendDto) {
    return this.campaignsService.testSend(id, dto.email);
  }

  @ApiOperation({
    summary: '[admin] Надіслати всім активним підписникам',
    description:
      'Стартує фонову відправку. Ендпоінт повертається одразу з campaignId та recipientsCount. Прогрес видно через GET /:id.',
  })
  @ApiParam({ name: 'id', description: 'ID розсилки (MongoID)' })
  @ApiResponse({ status: 202, description: 'Розсилка запущена.' })
  @ApiResponse({ status: 400, description: 'Немає активних підписників або кампанія вже надіслана.' })
  @Post(':id/send')
  @HttpCode(HttpStatus.ACCEPTED)
  sendToAll(@Param('id') id: string) {
    return this.campaignsService.sendToAll(id);
  }

  @ApiOperation({ summary: '[admin] Видалити розсилку' })
  @ApiParam({ name: 'id', description: 'ID розсилки (MongoID)' })
  @ApiResponse({ status: 204, description: 'Видалено.' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }
}
