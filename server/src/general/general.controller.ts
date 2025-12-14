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
} from '@nestjs/common';
import { GeneralService } from './general.service';
import { UpdateGeneralDto } from './dto/update-general.dto';
import { CreateSettingsTranslationDto } from './dto/create-settings-translation.dto';
import { UpdateSettingsTranslationDto } from './dto/update-settings-translation.dto';

@Controller('general-settings')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getSettings() {
    return this.generalService.getSettings();
  }

  @Get('/public')
  @HttpCode(HttpStatus.OK)
  getPublicSettingsWithTranslation() {
    return this.generalService.getPublicSettingsWithTranslation();
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  update(@Body() updateDto: UpdateGeneralDto) {
    return this.generalService.update(updateDto);
  }

  @Post('/translation')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSettingsTranslationDto) {
    return this.generalService.createSettingsTranslation(dto);
  }

  @Get('/translation')
  @HttpCode(HttpStatus.OK)
  getTranslations() {
    return this.generalService.findAllSettingsTranslations();
  }

  @Get('/translation/:id')
  @HttpCode(HttpStatus.OK)
  getOneTranslation(@Param('id') id: string) {
    return this.generalService.findOneSettingsTranslation(id);
  }

  @Patch('/translation/:id')
  @HttpCode(HttpStatus.OK)
  updateTranslation(
    @Param('id') id: string,
    @Body() dto: UpdateSettingsTranslationDto,
  ) {
    return this.generalService.updateSettingsTranslation(id, dto);
  }

  @Delete('/translation/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTranslation(@Param('id') id: string) {
    return this.generalService.removeSettingsTranslation(id);
  }
}
