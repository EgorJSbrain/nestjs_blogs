import { SkipThrottle } from '@nestjs/throttler'
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  HttpCode,
  UseGuards,
  Body,
} from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUserId } from '../auth/current-user-id.param.decorator'
import { appMessages } from '../constants/messages'
import { RoutesEnum } from '../constants/global'
import { GamesRepository } from './games.repository'
import { CheckPalyerInGameUseCase } from './use-cases/check-player-in-game-use-case'
import { CreateAnswerDto } from '../dtos/answers/create-answer.dto'
import { ProgressesRepository } from '../progresses/progresses.repository'
import { AnswerStatusEnum } from '../constants/answer'
import { GamesService } from './games.service'

@SkipThrottle()
@Controller(RoutesEnum.pairGameQuizPairs)
export class GamesController {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly gamesRepository: GamesRepository,
    private readonly progressesRepository: ProgressesRepository,
    private readonly checkPalyerInGameUseCase: CheckPalyerInGameUseCase,
    private readonly gamesService: GamesService,
  ) {}

  @Get('/my-current')
  @UseGuards(JWTAuthGuard)
  async getMyCurrentGame(
    @CurrentUserId() currentUserId: string
  ): Promise<any> {
    const atciveGame =
      await this.gamesRepository.getActiveGameOfUser(currentUserId)

    if (!!atciveGame) {
      return {
        id: atciveGame.id,
        firstPlayerProgress: {
          answers: atciveGame.firstPlayerProgress.answers.map(answer => ({
            questionId: answer.questionId,
            answerStatus: answer.answerStatus,
            addedAt: answer.createdAt
          })),
          player: {
            id: atciveGame.firstPlayerProgress.userId,
            login: atciveGame.firstPlayerProgress.user.login
          },
          score: atciveGame.firstPlayerProgress.score,
        },
        secondPlayerProgress: {
          answers: atciveGame.secondPlayerProgress.answers.map(answer => ({
            questionId: answer.questionId,
            answerStatus: answer.answerStatus,
            addedAt: answer.createdAt
          })),
          player: {
            id: atciveGame.secondPlayerProgress.userId,
            login: atciveGame.secondPlayerProgress.user.login
          },
          score: atciveGame.secondPlayerProgress.score
        },
        questions: atciveGame.questions?.map(question => ({
          id: question.id,
          body: question.question.body
        })),
        status: atciveGame.status,
        pairCreatedDate: atciveGame.createdAt,
        startGameDate: atciveGame.startGameDate,
        finishGameDate: atciveGame.finishGameDate
      }
    }

    const myCurrentGameIdPendingSecondUser =
      await this.gamesRepository.getMyCurrentGameInPendingSecondPalyer(
        currentUserId
      )

    if (!!myCurrentGameIdPendingSecondUser) {
      return myCurrentGameIdPendingSecondUser
    }

    throw new HttpException(
      { message: appMessages(appMessages().game).errors.notFound, field: '' },
      HttpStatus.NOT_FOUND
    )
  }

  @Get(':id')
  @UseGuards(JWTAuthGuard)
  async getGameById(
    @Param() params: { id: string },
    @CurrentUserId() currentUserId: string
  ): Promise<any> {
    const game = await this.gamesRepository.getExtendedGameById(params.id)

    if (!game) {
      throw new HttpException(
        { message: appMessages(appMessages().game).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const firstPlayerId = game.firstPlayerProgress ? game.firstPlayerProgress.userId : null
    const secondPlayerId = game.secondPlayerProgress ? game.secondPlayerProgress.userId : null

    const isCurrentUserGame = await this.checkPalyerInGameUseCase.execute(
      currentUserId,
      firstPlayerId,
      secondPlayerId
    )

    if (!isCurrentUserGame) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    return game
  }

  @Post('connection')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.OK)
  async connectToGame(@CurrentUserId() currentUserId: string): Promise<any> {
    const atciveGame =
      await this.gamesRepository.getActiveGameOfUser(currentUserId)

    if (!!atciveGame) {
      throw new HttpException(
        { message: appMessages().errors.activeGameExist, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    const gameInPendindSecondUser =
      await this.gamesRepository.getGameInPendingSecondPalyer()

    if (!gameInPendindSecondUser) {
      return await this.gamesRepository.createGame(currentUserId)
    }

    if (gameInPendindSecondUser.userId === currentUserId) {
      throw new HttpException(
        { message: appMessages().errors.activeGameExist, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    return await this.gamesRepository.connectToGame(
      currentUserId,
      gameInPendindSecondUser
    )
  }

  @Post('my-current/answers')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.OK)
  async answerToQuestion(
    @CurrentUserId() currentUserId: string,
    @Body() data: CreateAnswerDto
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const manager = queryRunner.manager;

      const atciveGame =
        await this.gamesRepository.getActiveGameOfUser(currentUserId)

    if (!atciveGame) {
      throw new HttpException(
        { message: appMessages(appMessages().game).errors.notFound, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    const progressId =
      atciveGame.firstPlayerProgress.userId === currentUserId
        ? atciveGame.firstPlayerProgressId
        : atciveGame.secondPlayerProgressId

    const firstPlayerId = atciveGame.firstPlayerProgress.userId
    const secondPlayerId = atciveGame.secondPlayerProgress.userId
    const firstPlayerProgressId = atciveGame.firstPlayerProgressId
    const secondPlayerProgressId = atciveGame.secondPlayerProgressId

    if (!firstPlayerId || !secondPlayerId || !firstPlayerProgressId || !secondPlayerProgressId) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.BAD_REQUEST
      )
    }

    const currentPlayerId =
      firstPlayerId === currentUserId ? firstPlayerId : secondPlayerId

    const anotherPlayerId =
      firstPlayerId !== currentUserId ? firstPlayerId : secondPlayerId

    const currentPlayerProgressId =
      atciveGame.firstPlayerProgress.userId === currentUserId
        ? firstPlayerProgressId
        : secondPlayerProgressId

    const anotherPlayerProgressId =
      atciveGame.firstPlayerProgress.userId !== currentUserId
        ? firstPlayerProgressId
        : secondPlayerProgressId

    const isCurrentUserGame = await this.checkPalyerInGameUseCase.execute(
      currentUserId,
      firstPlayerId,
      secondPlayerId
    )

    if (!isCurrentUserGame) {
      throw new HttpException(
        { message: appMessages(appMessages().game).errors.notFound, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    const questions = await this.gamesRepository.getGameQuestionsByGameId(
      atciveGame.id
    )

    const answersOfCurrentPlayer = await this.gamesRepository.getAnswersByProgressIdAndUserId(
      currentPlayerProgressId,
      currentPlayerId
    )

    // TODO fix hardcoded numbers
    if (answersOfCurrentPlayer.length >= 5) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    const answersOfAnotherPlayer = await this.gamesRepository.getAnswersByProgressIdAndUserId(
      anotherPlayerProgressId,
      anotherPlayerId
    )

    const answeredQuestion = await this.gamesRepository.answerToGameQuestion(
      data.answer,
      questions,
      progressId ?? '',
      currentUserId,
      manager,
      answersOfCurrentPlayer
    )

    // TODO fix hardcoded numbers
    if (answersOfAnotherPlayer.length >= 5 && answersOfCurrentPlayer.length >= 4) {
      await this.gamesService.finishCurrentGame(atciveGame.id, manager)
    }

    if (!answeredQuestion) {
      return null
    }

    if (answeredQuestion.answerStatus === AnswerStatusEnum.correct && progressId) {
      await this.progressesRepository.increaseScore(progressId, manager)
    }

    await queryRunner.commitTransaction();

    return {
      questionId: answeredQuestion.questionId,
      answerStatus: answeredQuestion.answerStatus,
      addedAt: answeredQuestion.createdAt,
    }

    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw new HttpException(
        { message: err.message || appMessages().errors.somethingIsWrong, field: '' },
        err.status || HttpStatus.BAD_REQUEST
      )
    } finally {
      await queryRunner.release();
    }
  }
}
