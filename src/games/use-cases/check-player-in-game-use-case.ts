import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import { appMessages } from '../../constants/messages'
import { IExtendedGame } from '../../types/game'

@Injectable()
export class CheckPalyerInGameUseCase {
  constructor() {}

  async execute(
    userId: string,
    firstPlayerId: string,
    secondPlayerId?: string
  ): Promise<boolean> {
    if (firstPlayerId === userId || secondPlayerId === userId) {
      return true
    } else {
      return false
    }
  }
}
