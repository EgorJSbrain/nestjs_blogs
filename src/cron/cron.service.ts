import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectDataSource } from '@nestjs/typeorm'
import { differenceInSeconds } from 'date-fns'

import { AnswerEntity } from '../entities/answer'
import { GameEntity } from '../entities/game'
import { GamesService } from '../games/games.service'
import { ProgressService } from '../progresses/progress.service'
import { GameQuestionEntity } from '../entities/game-question'
import { ANSWERS_MAX_LENGTH } from 'src/constants/answer'

const getLastAnswer = (answers: AnswerEntity[]) => {
  const sortedAnswers =
    answers
      .map((answer) => ({
        ...answer,
        createdAtMilliseconds: Number(answer.createdAt)
      }))
      .sort((a, b) => a.createdAtMilliseconds - b.createdAtMilliseconds) || []

  return sortedAnswers[sortedAnswers?.length - 1]
}

@Injectable()
export class CronService {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly gamesService: GamesService,
    private readonly progressService: ProgressService
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async genAttempts() {
    const queryRunner = this.dataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()
      const manager = queryRunner.manager

      const games = await this.gamesService.getAciveGames()

      const date = new Date()

      const finishedGames =
        games?.map(async (game) => {
          if (
            !game ||
            !game.firstPlayerProgress ||
            !game.secondPlayerProgress
          ) {
            return null
          }

          let finisgedGame: GameEntity | null = null

          const firstUserAnswers = game.firstPlayerProgress.answers || []
          const secondUserAnswers = game.secondPlayerProgress.answers || []
          const gameQuestions = game.questions || []

          if (
            firstUserAnswers?.length === ANSWERS_MAX_LENGTH &&
            secondUserAnswers.length < ANSWERS_MAX_LENGTH
          ) {
            finisgedGame = await this.finishGame({
              date,
              gameId: game.id,
              currentUserProgressId: game.firstPlayerProgress.id,
              currentUserProgressUserId: game.firstPlayerProgress.userId,
              anotherUserProgressId: game.secondPlayerProgress.id,
              anotherUserProgressUserId: game.secondPlayerProgress.userId,
              questions: gameQuestions,
              currentUserAnswers: firstUserAnswers,
              anotherUserAnswers: secondUserAnswers,
              manager
            })
          }

          if (
            secondUserAnswers.length === ANSWERS_MAX_LENGTH &&
            firstUserAnswers.length < ANSWERS_MAX_LENGTH
          ) {
            finisgedGame = await this.finishGame({
              date,
              gameId: game.id,
              currentUserProgressId: game.secondPlayerProgress.id,
              currentUserProgressUserId: game.secondPlayerProgress.userId,
              anotherUserProgressId: game.firstPlayerProgress.id,
              anotherUserProgressUserId: game.firstPlayerProgress.userId,
              questions: gameQuestions,
              currentUserAnswers: secondUserAnswers,
              anotherUserAnswers: firstUserAnswers,
              manager
            })
          }

          return finisgedGame || null
        }) || []

      await Promise.all(finishedGames)

      await queryRunner.commitTransaction()
    } catch (e) {
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
  }

  private async finishGame({
    date,
    gameId,
    currentUserProgressId,
    currentUserProgressUserId,
    anotherUserProgressId,
    anotherUserProgressUserId,
    questions,
    currentUserAnswers,
    anotherUserAnswers,
    manager
  }: {
    date: number | Date,
    gameId: string,
    currentUserProgressId: string,
    currentUserProgressUserId: string,
    anotherUserProgressId: string,
    anotherUserProgressUserId: string,
    questions: GameQuestionEntity[],
    currentUserAnswers: AnswerEntity[],
    anotherUserAnswers: AnswerEntity[],
    manager: EntityManager
  }) {
    let finishedGame: GameEntity | null = null
    const currentUserLastAnswer = getLastAnswer(currentUserAnswers)

    const diff = differenceInSeconds(date, currentUserLastAnswer.createdAt)

    if (diff >= 10) {
      const unansweredQuestions = this.getUnansweredQuestions(questions, currentUserAnswers)

      // const responseAnsweredQuestions = this.answerToQuestions({
      //   unansweredQuestions,
      //   questions,
      //   anotherUserProgressId,
      //   anotherUserProgressUserId,
      //   anotherUserAnswers,
      //   manager,
      // })
      const responseAnsweredQuestions = unansweredQuestions.map(async () => {
        return await this.gamesService.answerToGameQuestion(
          '',
          questions,
          anotherUserProgressId,
          anotherUserProgressUserId,
          manager,
          anotherUserAnswers
        )
      })

      await Promise.all(responseAnsweredQuestions)

      await this.progressService.markProgressesByResult(
        currentUserProgressId,
        anotherUserProgressId,
        manager
      )

      await this.gamesService.increasScoreToFirstFinishedGame(
        currentUserProgressId,
        currentUserProgressUserId,
        manager
      )

      finishedGame = await this.gamesService.finishCurrentGame(gameId, manager)
    }

    return finishedGame
  }

  private getUnansweredQuestions(questions: GameQuestionEntity[], answers: AnswerEntity[]){
    return questions.filter((question) => {
      if (
        !answers.find((answer) => answer.questionId === question.id)
      ) {
        return question
      }
    })
  }

  // private answerToQuestions({
  //   unansweredQuestions,
  //   questions,
  //   anotherUserProgressId,
  //   anotherUserProgressUserId,
  //   anotherUserAnswers,
  //   manager,
  // }: {
  //   unansweredQuestions: GameQuestionEntity[],
  //   questions: GameQuestionEntity[],
  //   anotherUserProgressId: string,
  //   anotherUserProgressUserId: string,
  //   anotherUserAnswers: AnswerEntity[],
  //   manager: EntityManager,
  // }) {
  //   return unansweredQuestions.map(async () =>
  //     await this.gamesService.answerToGameQuestion(
  //     '',
  //     questions,
  //     anotherUserProgressId,
  //     anotherUserProgressUserId,
  //     manager,
  //     anotherUserAnswers
  //   ))
  // }
}
