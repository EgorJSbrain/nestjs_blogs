import { NestFactory } from '@nestjs/core';
import ngrok from '@ngrok/ngrok'

import { AppModule } from './app.module';
import { appSettings } from './appSettings';
import { TelegramAdapter } from './adapters/telegram.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app)
  const port = process.env.PORT ?? '5000'
  await app.listen(port);

  const telegramAdapter = await app.resolve(TelegramAdapter)

  const listener = await ngrok.forward(
    {
      addr: Number(port),
      authtoken: process.env.NGROK_TOKEN
    }
  )

  await telegramAdapter.setWebhook(`${listener.url() ?? ''}/integrations/telegram/webhook`)
}

bootstrap();
