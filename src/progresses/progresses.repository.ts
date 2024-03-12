import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { ProgressEntity } from '../entities/progress';
import { UserEntity } from '../entities/user';
import { formatNumber } from '../utils/formaNumberForStatistic';

@Injectable()
export class ProgressesRepository {
  constructor(
    @InjectRepository(ProgressEntity)
    private readonly progressesRepo: Repository<ProgressEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>
  ) {}

  async getProgressesByUserIdAndGameId(userId: string | null, gameId: string): Promise<any> {
    try {
      const progress = this.progressesRepo
        .createQueryBuilder('progress')
        .select('progress.*')
        .where('progress.userId = :userId', { userId })
        .getOne()

      return progress
    } catch {
      return []
    }
  }

  async createProgress(userId: string): Promise<ProgressEntity | null> {
    try {
      const query = this.progressesRepo.createQueryBuilder('progress')

      const newProgress = await query
        .insert()
        .values({
          userId,
          score: 0
        })
        .execute()

      const progress = await this.getById(newProgress.raw[0].id)

      if (!progress) {
        return null
      }

      return progress
    } catch {
      return null
    }
  }

  async increaseScore(progressId: string, manager: EntityManager) {
    const progress = await this.progressesRepo.findOne({ where: { id: progressId } })

    if (!progress) {
      return null
    }

    return await manager.update(ProgressEntity, { id: progressId }, { score: progress.score + 1 })
  }

  async getById(id: string): Promise<ProgressEntity | null> {
    const progress = await this.progressesRepo
      .createQueryBuilder('progress')
      .select(['progress.id', 'progress.userId'])
      .where('progress.id = :id', { id })
      .getOne()

    if (!progress) {
      return null
    }

    return progress
  }

  async getAllByUserId(userId: string) {
      const statistic = await this.progressesRepo
      .createQueryBuilder('progress')
      .select([
        'COUNT(*) as gamesCount',
        'SUM(progress.score) as sumScore',
        'AVG(progress.score) as avgScores'
      ])
      .where('progress.userId = :userId', { userId })
      .groupBy('progress.userId')
      .getRawOne()

    if (!statistic) {
      return {
        gamesCount: 0,
        sumScore: 0,
        avgScores: 0
      }
    }

    return {
      gamesCount: Number(statistic.gamescount) ?? 0,
      sumScore: Number(statistic.sumscore) ?? 0,
      avgScores: Number(formatNumber(statistic.avgscores)) ?? 0,
    }
  }
}
