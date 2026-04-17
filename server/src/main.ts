import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { MongoExceptionFilter } from './filters/mongodb.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const PORT = process.env.PORT || 8080;
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://192.168.1.100:3000',
      'http://localhost:8000',
      'http://192.168.1.100:8000',
    ],
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
