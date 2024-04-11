import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid'

import { TelegramAdapter } from '../adapters/telegram.adapter';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepo: UsersRepository,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  async getTelegramBotLink(userId: string) {
    const user = await this.usersRepo.getById(userId)

    if (user && user.confirmationTelegramCode) {
      return {
        link: `${this.configService.get<string>('TELEGRAM_BOT_LINK')}?code=${
          user.confirmationTelegramCode
        }`
      }
    }

    const code = v4()
    await this.usersRepo.updateUser(userId, { confirmationTelegramCode: code })

    return { link: `${this.configService.get<string>('TELEGRAM_BOT_LINK')}?code=${code}` }
  }
}