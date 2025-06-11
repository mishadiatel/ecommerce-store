import { Injectable } from '@nestjs/common';
import { YcI18nService } from './yc-i18n/yc-i18n.service';

@Injectable()
export class AppService {
  constructor(private readonly i18n: YcI18nService) {
  }

  getHello(): string {
    return this.i18n.t('common.about', { args: { count: 5 } });
  }
}
