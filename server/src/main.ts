import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { MongoExceptionFilter } from './filters/mongodb.filter';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // ─── Swagger / OpenAPI ─────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription(
      [
        'REST API для e-commerce магазину: авторизація, товари, замовлення, оплати, контент.',
        '',
        '### Автентифікація',
        'Більшість захищених ендпоінтів очікує **JWT access token в HTTP-only cookie `accessToken`**.',
        'Refresh token зберігається в cookie `refreshToken` і використовується для оновлення access token через `POST /api/auth/refresh`.',
        'Для тестування у Swagger UI можна також передати access token у заголовку `Authorization: Bearer <token>`.',
        '',
        '### Ролі',
        'Ендпоінти, позначені `[admin]`, доступні лише користувачам з роллю `admin`.',
        '',
        '### Мова',
        'API підтримує локалізацію через query-параметр `?lang=ua|en` або заголовок `Accept-Language`.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token',
      },
      'accessToken',
    )
    .addCookieAuth('accessToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'accessToken',
      description: 'HTTP-only cookie з JWT access token (встановлюється на /auth/signin)',
    })
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description: 'HTTP-only cookie з JWT refresh token',
    })
    .addTag('Auth', 'Реєстрація, вхід, активація, refresh, скидання паролю')
    .addTag('Users', 'Керування користувачами (admin)')
    .addTag('Products', 'Товари та їх переклади')
    .addTag('Categories', 'Категорії товарів')
    .addTag('Cart', 'Корзина покупця / гостя')
    .addTag('Wishlist', 'Список бажань')
    .addTag('Orders', 'Замовлення, статуси, оплата')
    .addTag('Promo Codes', 'Промокоди зі знижками')
    .addTag('Banners', 'Банери на сайті')
    .addTag('Blocks', 'Контентні блоки сторінок')
    .addTag('Pages', 'Статичні сторінки')
    .addTag('FAQ', 'FAQ категорії та питання')
    .addTag('General Settings', 'Загальні налаштування сайту')
    .addTag('Mail Templates', 'Шаблони email-повідомлень')
    .addTag('Nova Poshta', 'Інтеграція з Nova Poshta')
    .addTag('Payments', 'LiqPay callback / server URL')
    .addTag('Upload', 'Завантаження файлів (зображень)')
    // .addTag('Locales', 'Список локалей / мов')
    .addTag('Health', 'Health-check / базовий стан сервісу')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'E-commerce API Docs',
  });

  await app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
  });
}

bootstrap();
