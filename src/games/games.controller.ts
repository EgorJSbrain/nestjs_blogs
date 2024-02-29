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

import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUserId } from '../auth/current-user-id.param.decorator'
import { appMessages } from '../constants/messages'
import { RoutesEnum } from '../constants/global'
import { GamesRepository } from './games.repository'
import { CheckPalyerInGameUseCase } from './use-cases/check-player-in-game-use-case'
import { CreateAnswerDto } from '../dtos/answers/create-answer.dto'
import { ProgressesRepository } from 'src/progresses/progresses.repository'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { AnswerStatusEnum } from 'src/constants/answer'
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
  async getAll(
    @CurrentUserId() currentUserId: string
  ): Promise<any> {
    const atciveGame =
      await this.gamesRepository.getActiveGameOfUser(currentUserId)

    if (!!atciveGame) {
      return atciveGame
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

    const firstPlayerId = atciveGame.firstPlayerProgress ? atciveGame.firstPlayerProgress.userId : null
    const secondPlayerId = atciveGame.secondPlayerProgress ? atciveGame.secondPlayerProgress.userId : null

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

    const isAllQuestionsAnswered = questions.every(question => question.answerId)

    if (isAllQuestionsAnswered) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    const answeredQuestion = await this.gamesRepository.answerToGameQuestion(
      data.answer,
      questions,
      progressId ?? '',
      currentUserId,
      manager
    )

    if (!answeredQuestion) {
      return null
    }

    if (answeredQuestion.answerStatus === AnswerStatusEnum.correct && progressId) {
      await this.progressesRepository.increaseScore(progressId, manager)
    }

    await this.gamesService.markQuestionAsAnswered(
      answeredQuestion.questionId,
      answeredQuestion.id,
      manager
    )

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
