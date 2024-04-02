import { Injectable } from '@nestjs/common'

@Injectable()
export class CheckPalyerInGameUseCase {
  constructor() {}

  async execute(
    userId: string,
    firstPlayerId: string | null,
    secondPlayerId?: string | null
  ): Promise<boolean> {
    if (firstPlayerId === userId || secondPlayerId === userId) {
      return true
    } else {
      return false
    }
  }
}
