import { Injectable } from '@nestjs/common';
import {
  DataSource,
  EntityTarget,
  ObjectLiteral,
  SelectQueryBuilder
} from 'typeorm'
import { InjectDataSource } from '@nestjs/typeorm';

import { LikeSourceTypeEnum, LikeStatusEnum } from '../constants/likes';
import { LikesRequestParams } from '../types/likes';
import { CommentLikeEntity } from '../entities/comment-like';
import { PostLikeEntity } from '../entities/post-like';
import { UserEntity } from '../entities/user';
import { appMessages } from '../constants/messages';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,

  ) {}

  async getSegmentOfLikesByParams(
    entity: EntityTarget<PostLikeEntity>,
    sourceId: string,
    limit: number,
    query: SelectQueryBuilder<PostLikeEntity | CommentLikeEntity>,
  ) {
    try {
      const querySearch = query
        .createQueryBuilder()
        .select('likes.*')
        .where("likes.sourceId = :sourceId AND likes.status = 'Like'", { sourceId })
        .addSelect((subQuery) => {
          return subQuery
            .select('u.login', 'login')
            .from(UserEntity, 'u')
            .where('likes.authorId = u.id')
        }, 'login')
        .from(entity, 'likes')
      .addOrderBy('likes.createdAt', 'DESC')
      .skip(0)
      .take(limit)

      const newLikes = await querySearch.getRawMany()
      const sortedNewsetLikes = newLikes.sort((a, b) => {
        if (Number(new Date(a.createdAt)) > Number(new Date(b.createdAt)))
          return -1
        return 1
      })

    return sortedNewsetLikes
    } catch(e) {
      throw new Error(appMessages().errors.somethingIsWrong)
    }
  }

  async createLike(
    likeStatus: LikeStatusEnum,
    sourceId: string,
    authorId: string,
    query: SelectQueryBuilder<PostLikeEntity | CommentLikeEntity>
  ) {
    try {
      await query
        .insert()
        .values({
          status: likeStatus,
          authorId,
          sourceId,
        })
        .execute()

        return true
    } catch(e) {
      throw new Error(appMessages().errors.somethingIsWrong)
    }
  }

  async updateLike(
    id: string,
    likeStatus: LikeStatusEnum,
    query: SelectQueryBuilder<PostLikeEntity | CommentLikeEntity>
  ) {
    const updatedLike = await query
      .update()
      .set({
        status: likeStatus
      })
      .where('id = :id', {
        id
      })
      .execute()

      if (!updatedLike.affected) {
        return false
      }

      return true
  }

  async getLikeBySourceIdAndAuthorId<T extends ObjectLiteral>(
    params: LikesRequestParams,
    query: SelectQueryBuilder<T>
  ) {
    try {
      const like = await query
        .select(`${params.sourceType}.*`)
        .where(
          `${params.sourceType}.authorId = :authorId AND ${params.sourceType}.sourceId = :sourceId`,
          {
            authorId: params.authorId,
            sourceId: params.sourceId
          }
        )
        .getRawOne()

    if (!like) {
      return null
    }

    return like
    } catch(e) {
      throw new Error(appMessages().errors.somethingIsWrong)
    }
  }

  async likeEntity(
    likeStatus: LikeStatusEnum,
    sourceId: string,
    sourceType: LikeSourceTypeEnum,
    authorId: string,
    query: SelectQueryBuilder<PostLikeEntity | CommentLikeEntity>,
  ) {
    try {
      const like = await this.getLikeBySourceIdAndAuthorId(
        {
          sourceType,
          sourceId,
          authorId
        },
        query
      )

      if (
        !like &&
        (likeStatus === LikeStatusEnum.like ||
          likeStatus === LikeStatusEnum.dislike)
      ) {

        const newLike = await this.createLike(
          likeStatus,
          sourceId,
          authorId,
          query
        )

        if (!newLike) {
          return false
        }
      }

      if (like && likeStatus !== like.status) {
        const updatedLike = await this.updateLike(like.id, likeStatus, query)

        if (!updatedLike) {
          return false
        }
      }

      return true
    } catch(e) {
      throw new Error(appMessages().errors.somethingIsWrong)
    }
  }
}
