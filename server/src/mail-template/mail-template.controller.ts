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
import { MailTemplateService } from './mail-template.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMailTemplateDto } from './dto/create-mail-template.dto';
import { UpdateMailTemplateDto } from './dto/update-mail-template.dto';
import { BaseQueryDto } from '../utils/base-query.dto';

@Controller('mail-template')
export class MailTemplateController {
  constructor(private readonly mailTemplateService: MailTemplateService) {}
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMailTemplateDto: CreateMailTemplateDto) {
    return this.mailTemplateService.create(createMailTemplateDto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: BaseQueryDto) {
    return this.mailTemplateService.findAll(query);
  }

  @Get('/getPublicMailTemplate/:slug')
  @HttpCode(HttpStatus.OK)
  findPublicMailTemplate(@Param('slug') slug: string) {
    return this.mailTemplateService.findPublicMailTemplate(slug);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.mailTemplateService.findOne(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateMailTemplateDto: UpdateMailTemplateDto,
  ) {
    return this.mailTemplateService.update(id, updateMailTemplateDto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.mailTemplateService.remove(id);
  }
}
