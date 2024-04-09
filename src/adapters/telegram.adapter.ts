import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'


@Injectable()
export class TelegramAdapter {
  constructor(private readonly configService: ConfigService) {}

  async setWebhook(url: string) {
    const token = this.configService.get<string>('TELEGRAM_TOKEN') ?? ''

    await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
      url
    })
  }
}
