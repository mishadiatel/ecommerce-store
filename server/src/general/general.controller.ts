import {
  Controller,
  Get,
  Body,
  Patch,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { GeneralService } from './general.service';
import { UpdateGeneralDto } from './dto/update-general.dto';

@Controller('general-settings')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getPublicSettings() {
    return this.generalService.getSettings();
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  update(@Body() updateDto: UpdateGeneralDto) {
    return this.generalService.update(updateDto);
  }
}
