import { Injectable } from '@nestjs/common'

import { GamesRepository } from './games.repository'
import { EntityManager } from 'typeorm'
import { GameStatusEnum } from '../enums/gameStatusEnum'
import { AnswerStatusEnum } from '../constants/answer'
import { ProgressesRepository } from '../progresses/progresses.repository'
import { AnswerEntity } from '../entities/answer'
import { GameQuestionEntity } from '../entities/game-question'
import { GameEntity } from '../entities/game'

@Injectable()
export class GamesService {
  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly progressesRepository: ProgressesRepository
  ) {}

  async finishCurrentGame(
    gameId: string,
    manager: EntityManager
  ): Promise<GameEntity | null> {
    const currentGame = await this.gamesRepository.getById(gameId)

    if (!currentGame) {
      return null
    }

    currentGame.finishGameDate = new Date()
    currentGame.status = GameStatusEnum.finished

    return manager.save(currentGame)
  }

  async increasScoreToFirstFinishedGame(
    anotherPlayerProgressId: string,
    anotherPlayerId: string,
    manager: EntityManager
  ) {

    const answers = await this.gamesRepository.getAnswersByProgressIdAndUserId(
      anotherPlayerProgressId,
      anotherPlayerId,
      manager
    )

    const allAnswersIncorrect = answers.every(
      (answer) => answer.answerStatus === AnswerStatusEnum.incorrect
    )

    if (!allAnswersIncorrect) {
      return await this.progressesRepository.increaseScore(
        anotherPlayerProgressId,
        manager
      )
    }
  }

  async getAciveGames() {
    return await this.gamesRepository.getActiveGames()
  }

  async answerToGameQuestion(
    answer: string,
    questions: GameQuestionEntity[],
    progressId: string,
    userId: string,
    manager: EntityManager,
    answers: AnswerEntity[]
  ): Promise<any> {
    let answerForQuestion: AnswerEntity | null = null

    for (let i = 0; i <= questions.length; i++) {
      const question = questions[i]
      const isQuestionAnswered = answers.find(
        (answer) => answer.questionId === question.id
      )

      if (!isQuestionAnswered) {
        answerForQuestion = await this.answerToQuestion(
          answer,
          question,
          progressId,
          userId,
          manager
        )

        break
      } else {
        continue
      }
    }

    return answerForQuestion
  }

  private async answerToQuestion(
    answer: string,
    question: GameQuestionEntity,
    progressId: string,
    userId: string,
    manager: EntityManager
  ): Promise<AnswerEntity> {
    const isCorrectAnswer = (
      JSON.parse(question.question.correctAnswers) as string[]
    ).includes(answer)

    const answerStatus = isCorrectAnswer
      ? AnswerStatusEnum.correct
      : AnswerStatusEnum.incorrect

    const newAnswer = manager.create(AnswerEntity)

    newAnswer.answerStatus = answerStatus
    newAnswer.progressId = progressId
    newAnswer.userId = userId
    newAnswer.questionId = question.id

    return await manager.save(newAnswer)
  }
}
