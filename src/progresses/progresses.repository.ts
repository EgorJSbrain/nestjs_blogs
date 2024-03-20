import { EntityManager, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { ProgressEntity } from '../entities/progress'
import { UserEntity } from '../entities/user'
import { formatNumber } from '../utils/formaNumberForStatistic'
import { RequestParams } from '../types/request'
import { prepareParamsForTopStatistic } from '../utils/prepareParamsForTopStatistic'

@Injectable()
export class ProgressesRepository {
  constructor(
    @InjectRepository(ProgressEntity)
    private readonly progressesRepo: Repository<ProgressEntity>
  ) {}

  async getProgressesByUserIdAndGameId(
    userId: string | null,
    gameId: string
  ): Promise<any> {
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

      if (!newProgress.raw[0]) {
        return null
      }

      return newProgress.raw[0]
    } catch (e) {
      return null
    }
  }

  async increaseScore(progressId: string, manager: EntityManager) {
    const progress = await this.progressesRepo.findOne({
      where: { id: progressId }
    })

    if (!progress) {
      return null
    }

    return await manager.update(
      ProgressEntity,
      { id: progressId },
      { score: progress.score + 1 }
    )
  }

  async getById(id: string): Promise<ProgressEntity | null> {
    const progress = await this.progressesRepo.findOne({ where: { id } })

    if (!progress) {
      return null
    }

    return progress
  }

  async getGamesStatisticByUserId(userId: string) {
    const statistic = await this.progressesRepo
      .createQueryBuilder('progress')
      .select([
        'COUNT(*) as gamesCount',
        'SUM(progress.score) as sumScore',
        'AVG(progress.score) as avgScores',
        "COUNT(CASE WHEN progress.status = 'Win' THEN 1 END) as wins",
        "COUNT(CASE WHEN progress.status = 'Lose' THEN 1 END) as loses",
        "COUNT(CASE WHEN progress.status = 'Draw' THEN 1 END) as draws"
      ])
      .where('progress.userId = :userId AND progress.status IS NOT NULL', {
        userId
      })
      .groupBy('progress.userId')
      .getRawOne()

    if (!statistic) {
      return {
        gamesCount: 0,
        sumScore: 0,
        avgScores: 0,
        winsCount: 0,
        lossesCount: 0,
        drawsCount: 0
      }
    }

    return {
      gamesCount: Number(statistic.gamescount) ?? 0,
      sumScore: Number(statistic.sumscore) ?? 0,
      avgScores: Number(formatNumber(statistic.avgscores)) ?? 0,
      winsCount: Number(statistic.wins) ?? 0,
      lossesCount: Number(statistic.loses) ?? 0,
      drawsCount: Number(statistic.draws) ?? 0
    }
  }

  async getStatisticOfTopUsers(params: RequestParams) {
    const { sort, pageNumber = 1, pageSize = 10 } = params
    let sortParams = sort

    if (sort && typeof sort === 'string') {
      sortParams = [sort]
    }

    const sortingParams = sortParams
      ? prepareParamsForTopStatistic(sortParams)
      : {}

    const pageSizeNumber = Number(pageSize)
    const pageNumberNum = Number(pageNumber)
    const skip = (pageNumberNum - 1) * pageSizeNumber

    const statisticQuery = this.progressesRepo
      .createQueryBuilder('progress')
      .select([
        'progress.userId as userId',
        'COUNT(*) as gamesCount',
        'SUM(progress.score) as sum',
        'AVG(progress.score) as avg',
        "COUNT(CASE WHEN progress.status = 'Win' THEN 1 END) as wins",
        "COUNT(CASE WHEN progress.status = 'Lose' THEN 1 END) as losses",
        "COUNT(CASE WHEN progress.status = 'Draw' THEN 1 END) as draws"
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('user.login', 'login')
          .from(UserEntity, 'user')
          .where('progress.userId = user.id')
      }, 'login')
      .where('progress.status IS NOT NULL')
      .groupBy('progress.userId')
      .skip(skip)
      .take(pageSizeNumber)

    const countResult = await this.progressesRepo
      .createQueryBuilder('progress')
      .select('COUNT(DISTINCT progress.userId)', 'totalCount')
      .getRawOne()

    for (const key in sortingParams) {
      let column: null | string = null

      if (sortingParams.hasOwnProperty('winsCount') && key === 'winsCount') {
        column = 'wins'
      }

      if (key === 'avgScores') {
        column = 'avg'
      }

      if (key === 'sumScore') {
        column = 'sum'
      }

      if (
        sortingParams.hasOwnProperty('lossesCount') &&
        key === 'lossesCount'
      ) {
        column = 'losses'
      }

      if (sortingParams.hasOwnProperty('drawsCount') && key === 'drawsCount') {
        column = 'draws'
      }

      if (column) {
        statisticQuery.addOrderBy(column, sortingParams[key])
      }
    }

    const count = Number(countResult.totalCount)
    const result = await statisticQuery.getRawMany()
    const pagesCount = Math.ceil(count / pageSizeNumber)

    const statisticResult = result.map((item) => ({
      gamesCount: Number(item.gamescount) ?? 0,
      winsCount: Number(item.wins) ?? 0,
      lossesCount: Number(item.losses) ?? 0,
      drawsCount: Number(item.draws) ?? 0,
      sumScore: Number(item.sum) ?? 0,
      avgScores: Number(formatNumber(item.avg)) ?? 0,
      player: {
        id: item.userid,
        login: item.login
      }
    }))

    return {
      pagesCount,
      page: pageNumberNum,
      pageSize: pageSizeNumber,
      totalCount: count,
      items: statisticResult
    }
  }
}
