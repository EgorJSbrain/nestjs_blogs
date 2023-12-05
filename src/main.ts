import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { appSettings } from './appSettings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app)
  await app.listen(process.env.PORT ?? '5000');
}

bootstrap();
