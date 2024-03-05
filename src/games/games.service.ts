import { Injectable } from '@nestjs/common'

import { CreateDeviceDto } from '../dtos/devices/create-device.dto'
import { GamesRepository } from './games.repository'
import { EntityManager } from 'typeorm'
import { GameEntity } from '../entities/game'
import { GameStatusEnum } from '../enums/gameStatusEnum'

@Injectable()
export class GamesService {
  constructor(
    private readonly gamesRepository: GamesRepository,
  ) {}

  async checkAnsweredQuestions(gameId: string) {
    // const questions = await this.gamesRepository.getGameQuestionsByGameId(gameId)

    // return !!questions.every(question => question.answer)
  }

  async finishCurrentGame(gameId: string, manager: EntityManager) {
    return await manager.update(
      GameEntity,
      { id: gameId },
      { finishGameDate: new Date(), status: GameStatusEnum.finished }
    )
  }
}
