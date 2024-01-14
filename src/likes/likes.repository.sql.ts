import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { Like, LikeDocument } from './likes.schema';
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
      dislikesCount: dislikesCount[0].count,
      likesCount: likesCount[0].count,
    }
  }

  async getSegmentOfLikesByParams(
    sourceType: LikeSourceTypeEnum,
    sourceId: string,
    limit: number,
    authorId?: string
  ) {

    let params = [sourceId]
    let countQuery = `
      SELECT count(*) AS count
        FROM public.${sourceType}_likes
        WHERE "sourceId" = $1 AND "status" = '${LikeStatusEnum.like}'
    `

    let query = `
      SELECT *
        FROM public.${sourceType}_likes
        WHERE "sourceId" = $1 AND "status" = '${LikeStatusEnum.like}'
    `

    if (authorId) {
      countQuery = `
        SELECT count(*) AS count
          FROM public.${sourceType}_likes
          WHERE "sourceId" = $1 AND "authorId"=$2 AND "status" = '${LikeStatusEnum.like}'
      `

      params = [sourceId, authorId]

      query = `
        SELECT *
          FROM public.${sourceType}_likes
          WHERE "sourceId" = $1 AND "authorId"=$2 AND "status" = '${LikeStatusEnum.like}'
      `
    }


    const count = await this.dataSource.query(countQuery, params)
    const likes = await this.dataSource.query(query, params)
    // TODO implemetn functionality for count newest likes
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
    console.log("userId:", params)

    const query = `
      SELECT *
        FROM public.${params.sourceType}_likes
        WHERE "authorId" = $1 AND "sourceId" = $2
    `
    const likes = await this.dataSource.query<ILike[]>(query, [
      params.authorId,
      params.sourceId
    ])
    console.log("!!!!!!likes:", likes)

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
