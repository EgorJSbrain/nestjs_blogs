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
  Query,
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
import { ANSWERS_MAX_LENGTH, AnswerStatusEnum } from '../constants/answer'
import { GamesService } from './games.service'
import { Answer } from '../types/answer'
import { prepareGame } from '../utils/prepareGame'
import { RequestParams } from '../types/request'

@SkipThrottle()
@Controller(RoutesEnum.pairGameQuiz)
export class GamesController {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly gamesRepository: GamesRepository,
    private readonly progressesRepository: ProgressesRepository,
    private readonly checkPalyerInGameUseCase: CheckPalyerInGameUseCase,
    private readonly gamesService: GamesService,
  ) {}

  @Get('pairs/my-current')
  @UseGuards(JWTAuthGuard)
  async getMyCurrentGame(
    @CurrentUserId() currentUserId: string
  ): Promise<any> {
    const atciveGame =
      await this.gamesRepository.getActiveGameOfUser(currentUserId)

    if (!!atciveGame) {
      return prepareGame(atciveGame)
    }

    const myCurrentGameIdPendingSecondUser =
      await this.gamesRepository.getMyCurrentGameInPendingSecondPalyer(
        currentUserId
      )

    if (!!myCurrentGameIdPendingSecondUser) {
      return prepareGame(myCurrentGameIdPendingSecondUser)
    }

    throw new HttpException(
      { message: appMessages(appMessages().game).errors.notFound, field: '' },
      HttpStatus.NOT_FOUND
    )
  }

  @Get('pairs/my')
  @UseGuards(JWTAuthGuard)
  async getMyGames(
    @Query() query: RequestParams,
    @CurrentUserId() currentUserId: string
  ): Promise<any> {
    console.log('MY CURRR')
    const data = await this.gamesRepository.getAllGamesByUserId({
      userId: currentUserId,
      params: query
    })

    return data
  }

  @Get('pairs/:id')
  @UseGuards(JWTAuthGuard)
  async getGameById(
    @Param() params: { id: string },
    @CurrentUserId() currentUserId: string
  ) {
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

    return prepareGame(game)
  }

  @Get('pairs/my-statistic')
  @UseGuards(JWTAuthGuard)
  async getStatisticByUserId(
    @CurrentUserId() currentUserId: string
  ): Promise<any> {
    const statistic = await this.gamesRepository.getStatisticByUserId(currentUserId)
  }

  @Post('pairs/connection')
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

    const game = await this.gamesRepository.connectToGame(
      currentUserId,
      gameInPendindSecondUser
    )

    return prepareGame(game)
  }

  @Post('pairs/my-current/answers')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.OK)
  async answerToQuestion(
    @CurrentUserId() currentUserId: string,
    @Body() data: CreateAnswerDto
  ): Promise<Answer | null> {
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

    const firstPlayerId = atciveGame.firstPlayerProgress?.userId
    const secondPlayerId = atciveGame.secondPlayerProgress?.userId
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
      atciveGame.firstPlayerProgress?.userId === currentUserId
        ? firstPlayerProgressId
        : secondPlayerProgressId

    const anotherPlayerProgressId =
      atciveGame.firstPlayerProgress?.userId !== currentUserId
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

    if (answersOfCurrentPlayer.length >= ANSWERS_MAX_LENGTH) {
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
      currentPlayerProgressId ?? '',
      currentUserId,
      manager,
      answersOfCurrentPlayer
    )

    if (
      answersOfAnotherPlayer.length >= ANSWERS_MAX_LENGTH &&
      answersOfCurrentPlayer.length >= ANSWERS_MAX_LENGTH - 1
    ) {
      await this.progressesRepository.increaseScore(
        anotherPlayerProgressId,
        manager
      )

      await this.gamesService.finishCurrentGame(atciveGame.id, manager)
    }

    if (!answeredQuestion) {
      return null
    }

    if (answeredQuestion.answerStatus === AnswerStatusEnum.correct && currentPlayerProgressId) {
      await this.progressesRepository.increaseScore(currentPlayerProgressId, manager)
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
