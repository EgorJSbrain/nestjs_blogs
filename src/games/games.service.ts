import { Injectable } from '@nestjs/common'

import { CreateDeviceDto } from '../dtos/devices/create-device.dto'
import { GamesRepository } from './games.repository'
import { EntityManager } from 'typeorm'
import { GameQuestionEntity } from 'src/entities/game-question'

@Injectable()
export class GamesService {
  constructor(
    private readonly gamesRepository: GamesRepository,
  ) {}

  async checkAnsweredQuestions(gameId: string) {
    const questions = await this.gamesRepository.getGameQuestionsByGameId(gameId)

    return !!questions.every(question => question.answer)
  }

  async markQuestionAsAnswered(questionId: string, answerId: string, manager: EntityManager) {
    console.log("🚀 ~ GamesService ~ markQuestionAsAnswered ~ answerId:", answerId)
    console.log("🚀 ~ GamesService ~ markQuestionAsAnswered ~ questionId:", questionId)
    return await manager.update(GameQuestionEntity, { id: questionId }, { answerId })
  }
}
