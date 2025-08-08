import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { YcI18nService } from '../yc-i18n/yc-i18n.service';
import { Request } from 'express';

@Injectable()
export class UploadService {
  constructor(private readonly i18n: YcI18nService) {}

  uploadFile(file: Express.Multer.File, req: Request) {
    if (!file) {
      throw new HttpException(
        this.i18n.t('validation.not_uploaded_file'),
        HttpStatus.BAD_REQUEST,
      );
    }
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/files/${file.filename}`;
    return { fileUrl };
  }
}
