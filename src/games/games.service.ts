import { Injectable } from '@nestjs/common'

import { GamesRepository } from './games.repository'
import { EntityManager } from 'typeorm'
import { GameStatusEnum } from '../enums/gameStatusEnum'
import { AnswerStatusEnum } from '../constants/answer'
import { ProgressesRepository } from '../progresses/progresses.repository'

@Injectable()
export class GamesService {
  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly progressesRepository: ProgressesRepository,
  ) {}

  async finishCurrentGame(gameId: string, manager: EntityManager) {
     const currentGame = await this.gamesRepository.getById(gameId)

     if (!currentGame) {
      return null
     }

     currentGame.finishGameDate = new Date()
     currentGame.status = GameStatusEnum.finished

     return manager.save(currentGame)
  }

  async increasScoreToFirstFinishedGame(anotherPlayerProgressId: string, anotherPlayerId: string, manager: EntityManager) {
    const answers = await this.gamesRepository.getAnswersByProgressIdAndUserId(
      anotherPlayerProgressId,
      anotherPlayerId,
      manager
    )

    const allAnswersIncorrect = answers.every(answer => answer.answerStatus === AnswerStatusEnum.incorrect)

    if (!allAnswersIncorrect) {
      return await this.progressesRepository.increaseScore(
        anotherPlayerProgressId,
        manager
      )
    }
  }
}
