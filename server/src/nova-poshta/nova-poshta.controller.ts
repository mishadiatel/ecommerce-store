import { Controller, Get, Query } from '@nestjs/common';
import { NovaPoshtaService } from './nova-poshta.service';

@Controller('nova-poshta')
export class NovaPoshtaController {
  constructor(private readonly novaPoshtaService: NovaPoshtaService) {}
  @Get('cities')
  searchCities(@Query('q') q: string) {
    return this.novaPoshtaService.searchCities(q);
  }
  @Get('warehouses')
  getWarehouses(@Query('cityRef') cityRef: string, @Query('q') q?: string) {
    return this.novaPoshtaService.getWarehouses(cityRef, q);
  }
}
