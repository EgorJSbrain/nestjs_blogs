import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { LikeSourceTypeEnum, LikeStatusEnum } from '../constants/likes';
import { ILike, ILikesInfo, LikesRequestParams } from '../types/likes';
import { CreateLikeDto } from '../dtos/like/create-like.dto';

@Injectable()
export class LikesSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getLikesCountsBySourceId(
    sourceType: LikeSourceTypeEnum,
    sourceId: string
  ) {
    const query = `
      SELECT count(*) AS count
        FROM public.${sourceType}_likes
        WHERE "sourceId" = $1 AND "status" = $2
    `

    const likesCount = await this.dataSource.query(query, [
      sourceId,
      LikeStatusEnum.like
    ])

    const dislikesCount = await this.dataSource.query(query, [
      sourceId,
      LikeStatusEnum.dislike
    ])

    return {
      sourceId,
      dislikesCount: Number(dislikesCount[0].count),
      likesCount: Number(likesCount[0].count),
    }
  }

  async getSegmentOfLikesByParams(
    sourceType: LikeSourceTypeEnum,
    sourceId: string,
    limit: number,
    authorId?: string
  ) {

    let countParams = [sourceId]
    let params = [sourceId, limit]
    let countQuery = `
      SELECT count(*) AS count
        FROM public.${sourceType}_likes
        WHERE "sourceId" = $1 AND "status" = '${LikeStatusEnum.like}'
    `

    let query = `
      SELECT *
        FROM public.${sourceType}_likes
        WHERE "sourceId" = $1 AND "status" = '${LikeStatusEnum.like}'
        LIMIT $2
    `

    if (authorId) {
      countQuery = `
        SELECT count(*) AS count
          FROM public.${sourceType}_likes
          WHERE "sourceId" = $1 AND "authorId"=$2 AND "status" = '${LikeStatusEnum.like}'
      `

      countParams = [sourceId, authorId]
      params = [sourceId, authorId, limit]

      query = `
        SELECT *
          FROM public.${sourceType}_likes
          WHERE "sourceId" = $1 AND "authorId"=$2 AND "status" = '${LikeStatusEnum.like}'
          LIMIT $3
      `
    }


    const count = await this.dataSource.query(countQuery, countParams)
    const newLikes = await this.dataSource.query(query, params)

    const sortedNewsetLikes = newLikes.sort((a, b) => {
      if (Number(new Date(a.createdAt)) > Number(new Date(b.createdAt))) return -1
      return 1
    })

    return sortedNewsetLikes.map(like => ({
      id: like.id,
      login: like.login,
      authorId: like.authorId,
      sourceId: like.sourceId,
      status: like.status,
      createdAt: like.createdAt,
    }))
  }

  async createLike(
    likeStatus: LikeStatusEnum,
    sourceId: string,
    sourceType: LikeSourceTypeEnum,
    authorId: string
  ) {
    const query = `
      INSERT INTO public.${sourceType}_likes(
        "authorId", "sourceId", "status"
      )
        VALUES ($1, $2, $3)
    `

    const likes = await this.dataSource.query(query, [
      authorId,
      sourceId,
      likeStatus
    ])

    return likes[0]
  }

  async updateLike(id: string, sourceType: LikeSourceTypeEnum, likeStatus: LikeStatusEnum) {
    const query = `
      UPDATE public.${sourceType}_likes
        SET "status"=$2
        WHERE id = $1;
    `

    const likes = await this.dataSource.query<ILike[]>(query, [
      id,
      likeStatus
    ])

    if (!likes[0]) {
      return null
    }

    return likes[0]
  }

  async getLikeBySourceIdAndAuthorId(params: LikesRequestParams) {
    const query = `
      SELECT *
        FROM public.${params.sourceType}_likes
        WHERE "authorId" = $1 AND "sourceId" = $2
    `
    const likes = await this.dataSource.query<ILike[]>(query, [
      params.authorId,
      params.sourceId
    ])

    if (!likes[0]) {
      return null
    }

    return likes[0]
  }

  async likeEntity(
    likeStatus: LikeStatusEnum,
    sourceId: string,
    sourceType: LikeSourceTypeEnum,
    authorId: string
  ) {
    const like = await this.getLikeBySourceIdAndAuthorId({
      sourceType,
      sourceId,
      authorId
    })

    if (
      !like &&
      (likeStatus === LikeStatusEnum.like ||
        likeStatus === LikeStatusEnum.dislike)
    ) {
      const newLike = await this.createLike(
        likeStatus,
        sourceId,
        sourceType,
        authorId
      )

      if (!newLike) {
        return false
      }
    }

    if (like && likeStatus !== like.status) {
      const updatedLike = await this.updateLike(like.id, sourceType, likeStatus)

      if (!updatedLike) {
        return false
      }
    }

    return true
  }
}
