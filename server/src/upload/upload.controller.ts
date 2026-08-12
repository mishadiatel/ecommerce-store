import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { Request } from 'express';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  @ApiOperation({
    summary: 'Завантажити файл',
    description:
      'Завантажує файл (зображення / документ) на сервер у папку `uploads`. ' +
      'Максимальний розмір файлу — 50 MB. Повертає згенероване імʼя файлу, ' +
      'за яким його можна отримати через статичний ендпоінт `/files/:fileName`.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл для завантаження',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Файл успішно завантажено',
    schema: {
      type: 'object',
      properties: {
        fileName: {
          type: 'string',
          example: '1700000000000-123456789.jpg',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Файл не було передано' })
  @ApiResponse({
    status: 413,
    description: 'Розмір файлу перевищує ліміт (50 MB)',
  })
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    return this.uploadService.uploadFile(file, req);
  }
}
