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

@SkipThrottle()
@Controller(RoutesEnum.pairGameQuizPairs)
export class GamesController {
  constructor(
    private gamesRepository: GamesRepository,
    private checkPalyerInGameUseCase: CheckPalyerInGameUseCase,
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
    console.log("params:", params)
    console.log("currentUserId:", currentUserId)
    const game = await this.gamesRepository.getExtendedGameById(params.id)
    console.log(" game:", game)

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
    const atciveGame =
      await this.gamesRepository.getActiveGameOfUser(currentUserId)

    if (!atciveGame) {
      throw new HttpException(
        { message: appMessages(appMessages().game).errors.notFound, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    const questions = await this.gamesRepository.getGameQuestionsByGameId(atciveGame.id)

    const isAllQuestionsAnswered = questions.every(question => question.answer)

    if (isAllQuestionsAnswered) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.FORBIDDEN
      )
    }

    const answeredQuestion = await this.gamesRepository.answerToGameQuestion(data.answer, questions)
  }
}
