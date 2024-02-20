import { Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { RequestParams } from '../types/request';
import { ProgressesRepository } from '../progresses/progresses.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgressEntity } from '../entities/progress';
import { GameStatusEnum } from '../enums/gameStatusEnum';
import { GameEntity } from '../entities/game';
import { writeSql } from 'src/utils/sqlWriteFile';
import { CheckPalyerInGameUseCase } from './use-cases/check-player-in-game-use-case.repository';
import { IExtendedComment } from 'src/types/comments';
import { IExtendedGame } from 'src/types/game';
import { appMessages } from 'src/constants/messages';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gamesRepo: Repository<GameEntity>,

    private progressesRepository: ProgressesRepository,

    private checkPalyerInGameUseCase: CheckPalyerInGameUseCase,
  ) {}

  async getAccessibleGames(userId: string): Promise<IExtendedGame | null> {
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

      const game = this.checkPalyerInGameUseCase.execute(userId, existedGame)

      return game
    } catch (e) {
      return null
    }
  }

  async connectToGame(userId: string, gameId: string): Promise<any> {
    try {
      const existedGame = await this.getById(gameId)

      if (!existedGame) {
        throw new HttpException(
          {
            message: appMessages(appMessages().game).errors.notFound,
            field: ''
          },
          HttpStatus.FORBIDDEN
        )
      }

      const progresses = await this.progressesRepository.createProgress(userId)

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

        const startedGame = await this.getById(gameId)

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
    const game = this.gamesRepo
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
      .getOne()

    if (!game) {
      return null
    }

    return game
  }
}
