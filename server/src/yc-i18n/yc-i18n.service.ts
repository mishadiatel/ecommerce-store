import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class YcI18nService {
  constructor(private readonly i18n: I18nService) {
  }

  t(key: string, options?: Record<string, any>) {
    const context = I18nContext.current();
    const lang = context?.lang || 'ua';
    return this.i18n.translate<string>(key, { lang, ...options }) as string;
  }

  lang() {
    const context = I18nContext.current();
    return context?.lang || 'ua';
  }
}
