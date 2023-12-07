import { INestApplication, ValidationPipe } from "@nestjs/common"
import cookieParser from 'cookie-parser';
import { useContainer } from "class-validator";

import { HttpExceptionFilter } from './exception-filters/exception-filter';
import { generateResponseError } from './utils/generateResponseError';
import { AppModule } from "./app.module";

export const appSettings = (app: INestApplication) => {
  app.enableCors()
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: true,
    exceptionFactory: generateResponseError
  }))
  app.useGlobalFilters(new HttpExceptionFilter())

  useContainer(app.select(AppModule), { fallbackOnErrors: true })
}