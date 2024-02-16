import { IsNull, Not, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { RequestParams } from '../types/request';
import { ProgressesRepository } from '../progresses/progresses.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgressEntity } from '../entities/progress';
import { GameStatusEnum } from '../enums/gameStatusEnum';
import { GameEntity } from '../entities/game';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gamesRepo: Repository<GameEntity>,

    private progressesRepository: ProgressesRepository,
  ) {}

  async getAccessibleGames(): Promise<GameEntity[] | []> {
    try {
      const games = await this.gamesRepo
        .createQueryBuilder('game')
        .select('game.*')
        .where(
          'game.status = :status AND game.firstPlayerProgressId = :firstPlayer',
          { status: GameStatusEnum.pending, firstPlayer: Not(IsNull()) }
        )
        .getMany()
      return games
    } catch {
      return []
    }
  }

  async connectToGame(
    userId: string | null,
  ): Promise<any> {
    try {
      const progresses = this.progressesRepository.getProgressesByUserId(userId)
      return []
    } catch {
      return []
    }
  }

  async createGame(userId: string): Promise<GameEntity | null> {
    try {
      const query = this.gamesRepo.createQueryBuilder('game')

      const firstUserProgress = await this.progressesRepository.createProgress(userId)

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
      ])
      .where('game.id = :id', { id })
      .getOne()

    if (!game) {
      return null
    }

    return game
  }
}
