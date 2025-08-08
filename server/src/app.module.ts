import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  I18nYamlLoader,
  QueryResolver,
} from 'nestjs-i18n';
import { YcI18nModule } from './yc-i18n/yc-i18n.module';
import * as path from 'node:path';
import { MongooseModule } from '@nestjs/mongoose';
import { BannerModule } from './banner/banner.module';
import { FaqModule } from './faq/faq.module';
import * as process from 'node:process';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/locales'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang']),
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
    YcI18nModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || ''),
    BannerModule,
    FaqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
