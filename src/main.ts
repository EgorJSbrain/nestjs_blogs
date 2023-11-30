import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception-filters/exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: true,
    exceptionFactory: (errors) => {
      // TODO remove this logic to some util
      const errorsForResponse: {message: string, field: string}[] = []

      errors.forEach(err => {
        const constraintsKeys = Object.keys(err.constraints ?? {})
        constraintsKeys.forEach(constraintsKey => {
          errorsForResponse.push({
            message: err.constraints ? err.constraints[constraintsKey] : '',
            field: err.property,
          })
        })

      })

      throw new BadRequestException(errorsForResponse)
    }
  }))
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(process.env.PORT ?? '5000');
}

bootstrap();
