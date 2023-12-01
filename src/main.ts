import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception-filters/exception-filter';
import { generateResponseError } from './utils/generateResponseError';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: true,
    exceptionFactory: generateResponseError
  }))
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(process.env.PORT ?? '5000');
}

bootstrap();
