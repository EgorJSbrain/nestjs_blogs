import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'


@Injectable()
export class TelegramAdapter {
  botLink: string = 'https://api.telegram.org/bot'

  constructor(private readonly configService: ConfigService) {}

  async setWebhook(url: string) {
    const token = this.configService.get<string>('TELEGRAM_TOKEN') ?? ''

    await axios.post(`${this.botLink}${token}/setWebhook`, {
      url,
      drop_pending_updates: true
    })
  }

  async sendMessage(chatId: string, blogName: string) {
    const token = this.configService.get<string>('TELEGRAM_TOKEN') ?? ''

    return await axios.post(`${this.botLink}${token}/sendMessage`, {
      text: `Post for blog ${blogName} was created`,
      chat_id: Number(chatId)
    })
  }
}
