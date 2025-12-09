import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { MongoExceptionFilter } from './filters/mongodb.filter';

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: true,
    }),
  );
  app.useGlobalFilters(new MongoExceptionFilter());
  // app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap();
