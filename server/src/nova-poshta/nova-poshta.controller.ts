import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { NovaPoshtaService } from './nova-poshta.service';

@ApiTags('Nova Poshta')
@Controller('nova-poshta')
export class NovaPoshtaController {
  constructor(private readonly novaPoshtaService: NovaPoshtaService) {}
  @Get('cities')
  @ApiOperation({
    summary: 'Пошук міст Nova Poshta',
    description:
      'Проксі-запит до Nova Poshta API (`Address.searchSettlements`). ' +
      'Повертає до 20 населених пунктів, що відповідають рядку пошуку. ' +
      'Кожен елемент — обʼєкт з полями `value` (DeliveryCity, використовується як cityRef) та `label` (людиночитаєма назва).',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Рядок пошуку — початок або частина назви міста',
    example: 'Київ',
  })
  @ApiResponse({
    status: 200,
    description: 'Список знайдених міст',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', description: 'DeliveryCity (cityRef)' },
          label: { type: 'string', description: 'Повна назва населеного пункту' },
        },
      },
    },
  })
  @ApiResponse({
    status: 502,
    description: 'Помилка при звертанні до Nova Poshta API',
  })
  searchCities(@Query('q') q: string) {
    return this.novaPoshtaService.searchCities(q);
  }
  @Get('warehouses')
  @ApiOperation({
    summary: 'Список відділень Nova Poshta у місті',
    description:
      'Проксі-запит до Nova Poshta API (`Address.getWarehouses`). ' +
      'Повертає до 20 відділень / поштоматів у зазначеному місті, з можливим фільтром за рядком пошуку. ' +
      'Кожен елемент — обʼєкт з полями `value` (Ref відділення) та `label` (опис).',
  })
  @ApiQuery({
    name: 'cityRef',
    required: true,
    type: String,
    description: 'Ідентифікатор міста (значення `value` з ендпоінту `/cities`)',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Опціональний рядок пошуку по назві / номеру відділення',
  })
  @ApiResponse({
    status: 200,
    description: 'Список відділень',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', description: 'Ref відділення Nova Poshta' },
          label: { type: 'string', description: 'Опис відділення' },
        },
      },
    },
  })
  @ApiResponse({
    status: 502,
    description: 'Помилка при звертанні до Nova Poshta API',
  })
  getWarehouses(@Query('cityRef') cityRef: string, @Query('q') q?: string) {
    return this.novaPoshtaService.getWarehouses(cityRef, q);
  }
}
