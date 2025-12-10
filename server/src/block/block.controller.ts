import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { BlockService } from './block.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBlockDto) {
    return this.blockService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: any) {
    return this.blockService.findAll(query);
  }

  @Get('/public/:page')
  @HttpCode(HttpStatus.OK)
  findPublicBlocks(@Param('page') page: string) {
    return this.blockService.findPublicBlocks(page);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.blockService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdateBlockDto) {
    return this.blockService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.blockService.remove(id);
  }
}
