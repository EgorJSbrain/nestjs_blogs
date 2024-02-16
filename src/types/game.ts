import { GameStatusEnum } from '../enums/gameStatusEnum'

export interface IGame {
  id: string
  firstPlayerProgressId: string | null
  secondPlayerProgressId: string | null
  status: GameStatusEnum
  startGameDate: Date | null
  finishGameDate: Date | null
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}
