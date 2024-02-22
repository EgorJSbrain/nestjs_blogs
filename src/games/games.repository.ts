import { Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { RequestParams } from '../types/request';
import { ProgressesRepository } from '../progresses/progresses.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgressEntity } from '../entities/progress';
import { GameStatusEnum } from '../enums/gameStatusEnum';
import { GameEntity } from '../entities/game';
import { writeSql } from 'src/utils/sqlWriteFile';
import { CheckPalyerInGameUseCase } from './use-cases/check-player-in-game-use-case';
import { IExtendedGame } from '../types/game';
import { appMessages } from '../constants/messages';
import { GameQuestionEntity } from '../entities/game-questions';
import { GetRandomQuestionsForGameUseCase } from './use-cases/get-random-questions-for-game-use-case';
import { SetRandomQuestionsForGameUseCase } from './use-cases/set-random-questions-for-game-use-case';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gamesRepo: Repository<GameEntity>,

    private progressesRepository: ProgressesRepository,

    private checkPalyerInGameUseCase: CheckPalyerInGameUseCase,
    private getRandomQuestionsForGameUseCase: GetRandomQuestionsForGameUseCase,
    private setRandomQuestionsForGameUseCase: SetRandomQuestionsForGameUseCase,
  ) {}

  async getGameInPendingSecondPalyer(userId: string): Promise<IExtendedGame | null> {
    try {
      const existedGame = await this.gamesRepo
        .createQueryBuilder('game')
        .select('game.*')
        .where(
          'game.status = :status AND game.firstPlayerProgressId IS NOT NULL',
          { status: GameStatusEnum.pending }
        )
        .addSelect((subQuery) => {
          return subQuery
            .select('progress.userId', 'userId')
            .from(ProgressEntity, 'progress')
            .where('game.firstPlayerProgressId = progress.id')
        }, 'userId')
        .getRawOne()

        if (!existedGame) {
          return null
        }

      const game = this.checkPalyerInGameUseCase.execute(userId, existedGame)

      return game
    } catch (e) {
      return null
    }
  }

  async getActiveGameOfUser(userId: string): Promise<IExtendedGame | null> {
    try {
      const existedGame = await this.gamesRepo
        .createQueryBuilder('game')
        .select('game.*')
        .where(
          'game.status = :status AND game.firstPlayerProgressId IS NOT NULL AND game.secondPlayerProgressId IS NOT NULL',
          { status: GameStatusEnum.active }
        )
        .addSelect((subQuery) => {
          return subQuery
            .select('questions.questionId', 'questions')
            .from(GameQuestionEntity, 'questions')
            .where('game.id = questions.gameId')
        }, 'questions')
        .getRawOne()

        if (!existedGame) {
          return null
        }

      const game = this.checkPalyerInGameUseCase.execute(userId, existedGame)

      return game
    } catch (e) {
      console.log("🚀 ~ GamesRepository ~ getActiveGameOfUser ~ e:", e)
      return null
    }
  }

  async connectToGame(userId: string, existedGame: IExtendedGame): Promise<any> {
    try {
      const progresses = await this.progressesRepository.createProgress(userId)
      const questions = await this.getRandomQuestionsForGameUseCase.execute()
      await this.setRandomQuestionsForGameUseCase.execute(questions, existedGame.id)

      await this.gamesRepo
        .createQueryBuilder('game')
        .update()
        .set({
          secondPlayerProgressId: progresses?.id,
          startGameDate: new Date().toISOString(),
          status: GameStatusEnum.active
        })
        .where('id = :id', {
          id: existedGame.id
        })
        .execute()

        const startedGame = await this.getById(existedGame.id)

      return startedGame
    } catch {
      return []
    }
  }

  async createGame(userId: string): Promise<GameEntity | null> {
    try {
      const query = this.gamesRepo.createQueryBuilder('game')

      const firstUserProgress =
        await this.progressesRepository.createProgress(userId)

      if (!firstUserProgress) {
        return null
      }

      const newGame = await query
        .insert()
        .values({
          status: GameStatusEnum.pending,
          firstPlayerProgressId: firstUserProgress.id
        })
        .execute()

      const game = await this.getById(newGame.raw[0].id)

      if (!game) {
        return null
      }

      return game
      // return {
      //   ...game,
      //   questions: null
      // }
    } catch {
      return null
    }
  }

  async getById(id: string): Promise<GameEntity | null> {
    console.log('!!!!')
    try {
      const game = await this.gamesRepo
      .createQueryBuilder('game')
      .select([
        'game.id',
        'game.status',
        'game.createdAt' as 'game.pairCreatedDate',
        'game.startGameDate',
        'game.finishGameDate',
        'game.firstPlayerProgressId',
        'game.secondPlayerProgressId',
      ])
      .where('game.id = :id', { id })
      .addSelect((subQuery) => {
        return subQuery
          .select('game_questions.questionId', 'questions')
          .from(GameQuestionEntity, 'questions')
          .where('game.id = questions.gameId')
      }, 'questions')
      .getOne()
    console.log("🚀 ~ GamesRepository ~ getById ~ game:", game)

    if (!game) {
      return null
    }

    return game
    } catch(e) {
    console.log("🚀 ~ GamesRepository ~ getById ~ e:", e)
    return null
    }
    
  }
}
