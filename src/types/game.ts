import { GameStatusEnum } from '../enums/gameStatusEnum'

export interface IGame {
  id: string
  firstPlayerProgressId: string | null
  secondPlayerProgressId: string | null
  status: GameStatusEnum
  startGameDate: Date | null
  finishGameDate: Date | null
  questions: any[] | null
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export interface IExtendedGame extends IGame {
  userId: string
}
