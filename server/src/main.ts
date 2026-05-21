import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { MongoExceptionFilter } from './filters/mongodb.filter';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const PORT = process.env.PORT || 8080;
  const app = await NestFactory.create(AppModule);

  // LiqPay webhook sends application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));

  const isProduction = process.env.NODE_ENV === 'production';

  /**
   * Список дозволених origin'ів задається через env-змінну `CORS_ORIGINS`
   * (через кому). Приклад:
   *   CORS_ORIGINS=https://example.com,https://admin.example.com
   * У dev режимі також автоматично дозволяються localhost / приватні
   * мережі (192.168.x.x, 10.x.x.x, 172.16-31.x.x) на будь-якому порту,
   * щоб не міняти конфіг при запуску з іншого IP.
   */
  const corsAllowlist = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const devOriginPattern =
    /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

  app.enableCors({
    origin: (origin, callback) => {
      // Server-to-server, curl, mobile apps часто не присилають Origin
      if (!origin) return callback(null, true);

      if (corsAllowlist.includes(origin)) {
        return callback(null, true);
      }

      if (!isProduction && devOriginPattern.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: true,
    }),
  );

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalFilters(new MongoExceptionFilter());
  // app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap();
