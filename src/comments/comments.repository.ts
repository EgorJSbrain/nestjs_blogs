import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { RequestParams, ResponseBody } from '../types/request';
import {
  IExtendedComment,
  ICreateCommentType,
  ICreatedComment,
  IUpdateCommentType
} from '../types/comments'
import { IExtendedLike } from '../types/likes';
import {
  LENGTH_OF_NEWEST_LIKES_FOR_POST,
  LikeSourceTypeEnum,
  LikeStatusEnum
} from '../constants/likes'
import { SortDirections, SortType } from '../constants/global';
import { LikesRepository } from '../likes/likes.repository';
import { CommentEntity } from '../entities/comment';

const writeSql = async (sql: string) => {
  const fs = require('fs/promises')
  try {
    await fs.writeFile('sql.txt', sql)
  } catch (err) {
    console.log(err)
  }
}

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsRepo: Repository<CommentEntity>,

    @InjectDataSource() protected dataSource: DataSource,
    private likeSqlRepository: LikesRepository
  ) {}

  async getAll(
    params: RequestParams,
    sourceId: string,
    userId: string | null
  ): Promise<ResponseBody<IExtendedComment> | []> {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10
      } = params

      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber

      const query = this.commentsRepo.createQueryBuilder('comment')

      const searchObject = query
      .where('comment.sourceId = :sourceId', {
        sourceId: sourceId ? sourceId : undefined
      })
      // .leftJoinAndSelect('post.blog', 'blog')
      .addOrderBy(
        `comment.${sortBy}`,
        sortDirection?.toLocaleUpperCase() as SortType
      )
      .skip(skip)
      .take(pageSizeNumber)

      // const query = `
      //   SELECT c.*, u."login" AS "userLogin"
      //     FROM public.comments c
      //       LEFT JOIN public.users u
      //         ON c."authorId" = u.id
      //     WHERE "sourceId" = $1
      //     ORDER BY "${sortBy}" ${sortDirection?.toLocaleUpperCase()}
      //     LIMIT $2 OFFSET $3
      // `

      // let queryForCount = `
      //   SELECT count(*) AS count
      //     FROM public.comments
      //       WHERE "sourceId" = $1
      // `
      // const comments = await this.dataSource.query(query, [
      //   sourceId,
      //   pageSizeNumber,
      //   skip
      // ])

      // const countResult = await this.dataSource.query(queryForCount, [sourceId])
      // const count = countResult[0] ? Number(countResult[0].count) : 0

      const comments = await searchObject.take(pageSizeNumber).getMany()
      const count = await searchObject.getCount()

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
              userLogin: '',
              // userLogin: comment.userLogin,
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
        items: commentsWithInfoAboutLikes
      }
    } catch {
      return []
    }
  }

  async getById(id: string, userId?: string | null): Promise<IExtendedComment | null> {
    // let myLike: IExtendedLike | null = null

    // const query = `
    //   SELECT c.*, u."login" AS "userLogin"
    //     FROM public.comments c
    //       LEFT JOIN public.users u
    //         ON c."authorId" = u.id
    //         WHERE c.id = $1
    // `

    // const comments = await this.dataSource.query(query, [id])
    // const comment = comments[0]

    const query = this.commentsRepo.createQueryBuilder('comment')

    const comment = await query
      // .leftJoinAndSelect('post.blog', 'blog')
      .where('comment.id = :id', { id })
      .getOne()

    if (!comment) {
      return null
    }

    // const likesCounts = await this.likeSqlRepository.getLikesCountsBySourceId(
    //   LikeSourceTypeEnum.comments,
    //   comment.id
    // )

    // // TODO newst likes
    // const newestLikes = await this.likeSqlRepository.getSegmentOfLikesByParams(
    //   LikeSourceTypeEnum.comments,
    //   comment.id,
    //   LENGTH_OF_NEWEST_LIKES_FOR_POST
    // )

    // if (userId) {
    //   myLike = await this.likeSqlRepository.getLikeBySourceIdAndAuthorId({
    //     sourceType: LikeSourceTypeEnum.comments,
    //     sourceId: comment.id,
    //     authorId: userId
    //   })
    // }

    return {
      id: comment.id,
      commentatorInfo: {
        userId: comment.authorId,
        userLogin: '',
        // userLogin: comment.userLogin,
      },
      content: comment.content,
      createdAt: comment.createdAt,
      likesInfo: {
        // likesCount: likesCounts?.likesCount ?? 0,
        // dislikesCount: likesCounts?.dislikesCount ?? 0,
        // myStatus: myLike?.status ?? LikeStatusEnum.none
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.none
      }
    }
  }

  async createComment(data: ICreateCommentType): Promise<IExtendedComment | null> {
    try {
      const query = this.commentsRepo.createQueryBuilder('comment')

      const newComment = await query
        .insert()
        .values({
          content: data.content,
          authorId: data.userId,
          sourceId: data.sourceId,
        })
        .execute()

      const comment = await this.getById(newComment.raw[0].id)

      if (!comment) {
        return null
      }

      return comment
    } catch {
      return null
    }
    // const query = `
    //   INSERT INTO public.comments(
    //     "content", "authorId", "sourceId"
    //   )
    //     VALUES ($1, $2, $3)
    //     RETURNING id, "content", "authorId", "sourceId", "createdAt"
    // `

    // const comments = await this.dataSource.query(query, [
    //   data.content,
    //   data.userId,
    //   data.sourceId
    // ])

    // return comments[0]
  }

  async updateComment(data: IUpdateCommentType): Promise<boolean> {
    const updatedComment = await this.commentsRepo
    .createQueryBuilder('comment')
    .update()
    .set({
      content: data.content,
    })
    .where('id = :id', {
      id: data.id
    })
    .execute()

  if (!updatedComment.affected) {
    return false
  }

  return true
    // const query = `
    //   UPDATE public.comments
    //     SET "content"=$2
    //     WHERE id = $1;
    // `

    // await this.dataSource.query(query, [
    //   data.id,
    //   data.content
    // ])

    // return true
  }

  async deleteComment(id: string) {
    try {
      const comment = await this.commentsRepo
        .createQueryBuilder('comment')
        .delete()
        .where('id = :id', { id })
        .execute()

      return !!comment.affected
    } catch (e) {
      return false
    }
    // const query = `
    //   DELETE FROM public.comments
    //   WHERE id = $1
    // `
    // return this.dataSource.query(query, [id])
  }
}
