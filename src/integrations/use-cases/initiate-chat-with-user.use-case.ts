import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import { UsersRepository } from '../../users/users.repository'
import { appMessages } from '../../constants/messages'

@Injectable()
export class InitiateChatWithUserUseCase {
  constructor(private usersRepo: UsersRepository) {}

  async execute(
    telegramUserId: string,
    textMessage: string,
  ): Promise<boolean | null> {
    if (textMessage.includes('/start')) {
      const startParams = textMessage.split(' ')
      const code = startParams[1].replace('code=', '')

      const user = await this.usersRepo.getUserByConfirmationTelegramCode(code)

      if (!user) {
        throw new HttpException(
          { message: appMessages(appMessages().user).errors.notFound },
          HttpStatus.NOT_FOUND
        )
      }

      if (user && user.telegramId) {
        return null
      }

      return await this.usersRepo.updateUser(user.id, { telegramId: telegramUserId })

    } else {
      return null
    }
  }
}