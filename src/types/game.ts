import { ProgressEntity } from '../entities/progress'
import { GameStatusEnum } from '../enums/gameStatusEnum'
import { AnswerEntity } from '../entities/answer'
import { QuestionEntity } from '../entities/question'
import { GameQuestionEntity } from 'src/entities/game-question'

export interface IGame {
  id: string
  firstPlayerProgressId: string | null
  secondPlayerProgressId: string | null
  status: GameStatusEnum
  startGameDate: Date | null
  finishGameDate: Date | null
  questions: GameQuestionEntity[] | null
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

type Player = {
  id: string,
  login: string,
}

type ProgressWithPlayer = {
  player: Player,
  score: number,
  answers?: AnswerEntity[]
}

export interface IExtendedGameWithPlayer extends IGame {
  questions: null
  userId?: string
  firstPlayerProgress?: ProgressWithPlayer
}

export interface IExtendedGame extends IGame {
  userId?: string
  firstPlayerProgress?: ProgressEntity
  secondPlayerProgress?: ProgressEntity
  questions: GameQuestionEntity[] | null
}

// export interface IExtendedGameWithGameQuestions extends IGame {
//   userId?: string
//   firstPlayerProgress?: ProgressEntity
//   secondPlayerProgress?: ProgressEntity
//   questions: GameQuestionEntity[] | null
// }
