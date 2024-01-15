import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { RequestParams, ResponseBody } from '../types/request';
import { IComment, ICreateCommentType, ICreatedComment, IUpdateCommentType } from '../types/comments';
import { ILike } from '../types/likes';
import { LENGTH_OF_NEWEST_LIKES_FOR_POST, LikeSourceTypeEnum, LikeStatusEnum } from '../constants/likes';
import { SortDirectionsEnum } from '../constants/global';
import { LikesSqlRepository } from '../likes/likes.repository.sql';

@Injectable()
export class CommentsSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private likeSqlRepository: LikesSqlRepository
  ) {}

  async getAll(
    params: RequestParams,
    sourceId: string,
    userId: string | null
  ): Promise<ResponseBody<IComment> | []> {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirectionsEnum.desc,
        pageNumber = 1,
        pageSize = 10
      } = params

      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber

      const query = `
        SELECT c.*, u."login" AS "userLogin"
          FROM public.comments c
            LEFT JOIN public.users u
              ON c."authorId" = u.id
          WHERE "sourceId" = $1
          ORDER BY "${sortBy}" ${sortDirection.toLocaleUpperCase()}
          LIMIT $2 OFFSET $3
      `

      let queryForCount = `
        SELECT count(*) AS count
          FROM public.comments
            WHERE "sourceId" = $1
      `

      const comments = await this.dataSource.query(query, [
        sourceId,
        pageSizeNumber,
        skip
      ])

      const countResult = await this.dataSource.query(queryForCount, [sourceId])
      const count = countResult[0] ? Number(countResult[0].count) : 0
      const pagesCount = Math.ceil(count / pageSizeNumber)

        const commentsWithInfoAboutLikes = await Promise.all(comments.map(async (comment) => {
          const likesCounts =
            await this.likeSqlRepository.getLikesCountsBySourceId(
              LikeSourceTypeEnum.comments,
              comment.id
            )

          let likesUserInfo

          if (userId) {
            likesUserInfo = await this.likeSqlRepository.getLikeBySourceIdAndAuthorId({
              sourceType: LikeSourceTypeEnum.comments,
              sourceId: comment.id,
              authorId: userId})
          }

          return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            commentatorInfo: {
              userId: comment.authorId,
              userLogin: comment.userLogin,
            },
            likesInfo: {
              likesCount: likesCounts?.likesCount ?? 0,
              dislikesCount: likesCounts?.dislikesCount ?? 0,
              myStatus: likesUserInfo ? likesUserInfo.status : LikeStatusEnum.none
            }
          }
        }))

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        // items: comments
        items: commentsWithInfoAboutLikes
      }
    } catch {
      return []
    }
  }

  async getById(id: string, userId?: string | null): Promise<IComment | null> {
    let myLike: ILike | null = null

    const query = `
      SELECT c.*, u."login" AS "userLogin"
        FROM public.comments c
          LEFT JOIN public.users u
            ON c."authorId" = u.id
            WHERE c.id = $1
    `

    const comments = await this.dataSource.query(query, [id])
    const comment = comments[0]

    if (!comment) {
      return null
    }

    const likesCounts = await this.likeSqlRepository.getLikesCountsBySourceId(
      LikeSourceTypeEnum.posts,
      comment.id
    )

    // TODO newst likes
    const newestLikes = await this.likeSqlRepository.getSegmentOfLikesByParams(
      LikeSourceTypeEnum.posts,
      comment.id,
      LENGTH_OF_NEWEST_LIKES_FOR_POST
    )

    if (userId) {
      myLike = await this.likeSqlRepository.getLikeBySourceIdAndAuthorId({
        sourceType: LikeSourceTypeEnum.posts,
        sourceId: comment.id,
        authorId: userId
      })
    }

    return {
      id: comment.id,
      commentatorInfo: {
        userId: comment.authorId,
        userLogin: comment.userLogin,
      },
      content: comment.content,
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: likesCounts?.likesCount ?? 0,
        dislikesCount: likesCounts?.dislikesCount ?? 0,
        myStatus: myLike?.status ?? LikeStatusEnum.none
      }
    }
  }

  async createComment(data: ICreateCommentType): Promise<ICreatedComment> {
    const query = `
      INSERT INTO public.comments(
        "content", "authorId", "sourceId"
      )
        VALUES ($1, $2, $3)
        RETURNING id, "content", "authorId", "sourceId", "createdAt"
    `

    const comments = await this.dataSource.query(query, [
      data.content,
      data.userId,
      data.sourceId
    ])

    return comments[0]
  }

  async updateComment(data: IUpdateCommentType) {
    const query = `
      UPDATE public.comments
        SET "content"=$2
        WHERE id = $1;
    `

    await this.dataSource.query(query, [
      data.id,
      data.content
    ])

    return true
  }

  deleteComment(id: string) {
    const query = `
      DELETE FROM public.comments
      WHERE id = $1
    `
    return this.dataSource.query(query, [id])
  }
}
