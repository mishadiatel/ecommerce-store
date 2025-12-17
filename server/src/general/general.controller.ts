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
import { GeneralService } from './general.service';
import { UpdateGeneralDto } from './dto/update-general.dto';
import { CreateSettingsTranslationDto } from './dto/create-settings-translation.dto';
import { UpdateSettingsTranslationDto } from './dto/update-settings-translation.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('general-settings')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
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

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch()
  @HttpCode(HttpStatus.OK)
  update(@Body() updateDto: UpdateGeneralDto) {
    return this.generalService.update(updateDto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post('/translation')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSettingsTranslationDto) {
    return this.generalService.createSettingsTranslation(dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get('/translation')
  @HttpCode(HttpStatus.OK)
  getTranslations() {
    return this.generalService.findAllSettingsTranslations();
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get('/translation/:id')
  @HttpCode(HttpStatus.OK)
  getOneTranslation(@Param('id') id: string) {
    return this.generalService.findOneSettingsTranslation(id);
  }

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

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete('/translation/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTranslation(@Param('id') id: string) {
    return this.generalService.removeSettingsTranslation(id);
  }
}
