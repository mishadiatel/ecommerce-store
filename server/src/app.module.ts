import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { YcI18nModule } from './yc-i18n/yc-i18n.module';
import * as path from 'node:path';
import { MongooseModule } from '@nestjs/mongoose';
import { BannerModule } from './banner/banner.module';
import { FaqModule } from './faq/faq.module';
import * as process from 'node:process';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadModule } from './upload/upload.module';
import { PagesModule } from './pages/pages.module';
import { BlockModule } from './block/block.module';
import { GeneralModule } from './general/general.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { MailTemplateModule } from './mail-template/mail-template.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { LoggerModule } from 'nestjs-pino';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'ua',
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
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'uploads'),
      serveRoot: '/files',
    }),
    YcI18nModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || ''),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            singleLine: true,
            ignore: 'pid,hostname,req.headers,res.headers',
          },
        },

        // 🔥 custom message
        customLogLevel: (req, res) => {
          if (res.statusCode >= 500) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },

        customSuccessMessage: (req, res) =>
          `${req.method} ${req.url} ${res.statusCode}`,

        customErrorMessage: (req, res, err) =>
          `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
      },
    }),
    BannerModule,
    FaqModule,
    UploadModule,
    PagesModule,
    BlockModule,
    GeneralModule,
    UsersModule,
    AuthModule,
    MailModule,
    MailTemplateModule,
    CategoryModule,
    ProductModule,
    WishlistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
