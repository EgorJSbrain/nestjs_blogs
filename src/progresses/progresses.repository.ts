import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { RequestParams } from '../types/request';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgressEntity } from '../entities/progress';
import { UserEntity } from '../entities/user';

@Injectable()
export class ProgressesRepository {
  constructor(
    @InjectRepository(ProgressEntity)
    private readonly progressesRepo: Repository<ProgressEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>
  ) {}

  async getProgressesByUserId(userId: string | null): Promise<any> {
    try {
      const progresses = this.progressesRepo
        .createQueryBuilder('progress')
        .select('progress.*')
        .where('progress.userId = :userId', { userId })
        .getMany()

      return []
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
}
