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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '[admin] Створити відгук' })
  @ApiResponse({ status: 201, description: 'Створено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '[admin] Список відгуків',
    description: 'Пагінований список з фільтром за товаром, мовою, видимістю і пошуком.',
  })
  @ApiResponse({ status: 200, description: 'Список.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: ReviewQueryDto) {
    return this.reviewService.findAllAdmin(query);
  }

  @ApiOperation({
    summary: 'Публічні відгуки товару за мовою',
    description:
      'Повертає видимі відгуки товару у заданій мові з середньою оцінкою.',
  })
  @ApiParam({ name: 'productId', description: 'ID товару (MongoID)' })
  @ApiQuery({ name: 'language', required: false, example: 'ua' })
  @ApiResponse({ status: 200, description: 'Список відгуків + averageRating + count.' })
  @Get('public/product/:productId')
  @HttpCode(HttpStatus.OK)
  findPublicByProduct(
    @Param('productId') productId: string,
    @Query('language') language?: string,
  ) {
    return this.reviewService.findPublicByProduct(
      productId,
      language && language.trim() ? language.trim() : 'ua',
    );
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '[admin] Отримати відгук за ID' })
  @ApiParam({ name: 'id', description: 'ID (MongoID)' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '[admin] Оновити відгук' })
  @ApiParam({ name: 'id', description: 'ID (MongoID)' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewService.update(id, dto);
  }

  @ApiCookieAuth('accessToken')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '[admin] Видалити відгук' })
  @ApiParam({ name: 'id', description: 'ID (MongoID)' })
  @ApiResponse({ status: 204, description: 'Видалено.' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}
