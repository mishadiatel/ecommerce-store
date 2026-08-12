import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health-check кореневого ендпоінту',
    description:
      'Базовий ендпоінт для перевірки того, що API-сервер запущений і відповідає на запити.',
  })
  @ApiResponse({
    status: 200,
    description: 'Сервіс працює',
    schema: { type: 'string', example: 'Hello World!' },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
