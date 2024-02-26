import { IsNull, Not, Repository } from 'typeorm';
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
    private setRandomQuestionsForGameUseCase: SetRandomQuestionsForGameUseCase
  ) {}

  async getGameInPendingSecondPalyer(): Promise<IExtendedGame | null> {
    try {
      const existedGame: IExtendedGame | undefined = await this.gamesRepo
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

      return {
        ...existedGame,
        questions: null
      }
    } catch (e) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async getMyCurrentGameInPendingSecondPalyer(
    userId: string
  ): Promise<IExtendedGame | null> {
    try {
      const existedGame = await this.gamesRepo.findOne({
        where: {
            status: GameStatusEnum.pending,
            firstPlayerProgress: {
              userId
            }
          },
        relations: {
          firstPlayerProgress: true,
        }
      })

      if (!existedGame) {
        return null
      }

      return {
        ...existedGame,
        questions: null,
        userId
      }
    } catch (e) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async getActiveGameOfUser(userId: string): Promise<GameEntity | null> {
    try {
      const existedGame = await this.gamesRepo.findOne({
        where: [
          {
            status: GameStatusEnum.active,
            firstPlayerProgress: {
              userId
            }
          },
          {
            status: GameStatusEnum.active,
            secondPlayerProgress: {
              userId
            }
          }
        ],
        relations: {
          questions: true,
          firstPlayerProgress: true,
          secondPlayerProgress: true
        }
      })

      if (!existedGame) {
        return null
      }

      this.checkPalyerInGameUseCase.execute(
        userId,
        existedGame.firstPlayerProgress.userId,
        existedGame.secondPlayerProgress.userId
      )

      return existedGame
    } catch (e) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async connectToGame(
    userId: string,
    existedGame: IExtendedGame
  ): Promise<any> {
    try {
      const progress = await this.progressesRepository.createProgress(userId)
      const questions = await this.getRandomQuestionsForGameUseCase.execute()
      await this.setRandomQuestionsForGameUseCase.execute(
        questions,
        existedGame.id
      )

      await this.gamesRepo
        .createQueryBuilder('game')
        .update()
        .set({
          secondPlayerProgressId: progress?.id,
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
    } catch {
      return null
    }
  }

  async getById(id: string): Promise<GameEntity | null> {
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
          'game.secondPlayerProgressId'
        ])
        .where('game.id = :id', { id })
        .getOne()

      if (!game) {
        return null
      }

      return game
    } catch (e) {
      return null
    }
  }

  async getByIdWithQuestions(id: string): Promise<GameEntity | null> {
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
          'game.secondPlayerProgressId'
        ])
        .where('game.id = :id', { id })
        .addSelect((subQuery) => {
          return subQuery
            .select('game_questions.questionId', 'game_questions')
            .from(GameQuestionEntity, 'game_questions')
            .where('game.id = questions.gameId')
        }, 'game_questions')
        .getOne()

      if (!game) {
        return null
      }

      return game
    } catch (e) {
      return null
    }
  }
}
