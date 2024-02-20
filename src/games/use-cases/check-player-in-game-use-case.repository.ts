import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { appMessages } from '../../constants/messages';
import { IExtendedGame } from '../../types/game';

@Injectable()
export class CheckPalyerInGameUseCase {
  constructor() {}

  async execute (userId: string, game: IExtendedGame): Promise<IExtendedGame | null> {
    if (game.userId !== userId) {
      return game
    } else {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.FORBIDDEN
      )
    }
  }
}
