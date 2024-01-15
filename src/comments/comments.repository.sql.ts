import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Comment, CommentDocument } from './comments.schema';
import { RequestParams, ResponseBody } from '../types/request';
import { IComment, ICreateCommentType, IUpdateCommentType } from '../types/comments';
import { ILike } from '../types/likes';
import { LikesRepository } from '../likes/likes.repository';
import { LikeStatusEnum } from '../constants/likes';
import { SortDirectionsEnum } from '../constants/global';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikesSqlRepository } from 'src/likes/likes.repository.sql';

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
      console.log("sourceId:", sourceId)

      // TODO implement search with likes like in blogs
      const query = `
      SELECT c.*, u."login" AS "userLogin"
        FROM public.comments c
          LEFT JOIN public.users u
            ON c."authorId" = u.id
        WHERE "sourceId" = $1
        ORDER BY "${sortBy}" ${sortDirection.toLocaleUpperCase()}
        LIMIT $2 OFFSET $3
    `
    const comments = await this.dataSource.query(query, [
      sourceId,
      pageSizeNumber,
      skip
    ])
    console.log("comments:", comments)

      // const sort: Record<string, SortOrder> = {}
      // let filter: FilterQuery<CommentDocument> = { sourceId }

      // if (sortBy && sortDirection) {
      //   sort[sortBy] = sortDirection === SortDirectionsEnum.asc ? 1 : -1
      // }

      // if (userId) {
      //   filter = {
      //     ...filter,
      //    'authorInfo.userId': userId
      //   }
      // }

      // const pageSizeNumber = Number(pageSize)
      // const pageNumberNum = Number(pageNumber)
      // const skip = (pageNumberNum - 1) * pageSizeNumber
      // const count = await this.commentsModel.countDocuments(filter)
      // const pagesCount = Math.ceil(count / pageSizeNumber)

      // const comments = await this.commentsModel
      //   .find(filter, { _id: 0, __v: 0 })
      //   .skip(skip)
      //   .limit(pageSizeNumber)
      //   .sort(sort)
      //   .exec()

      //   const commentsWithInfoAboutLikes = await Promise.all(comments.map(async (comment) => {
      //     const likesCounts = await this.likeRepository.getLikesCountsBySourceId(comment.id)

      //     let likesUserInfo

      //     if (userId) {
      //       likesUserInfo = await this.likeRepository.getLikeBySourceIdAndAuthorId({
      //         sourceId: comment.id,
      //         authorId: userId})
      //     }

      //     return {
      //       id: comment.id,
      //       content: comment.content,
      //       createdAt: comment.createdAt,
      //       commentatorInfo: {
      //         userId: comment.authorInfo.userId,
      //         userLogin: comment.authorInfo.userLogin,
      //       },
      //       likesInfo: {
      //         likesCount: likesCounts?.likesCount ?? 0,
      //         dislikesCount: likesCounts?.dislikesCount ?? 0,
      //         myStatus: likesUserInfo ? likesUserInfo.status : LikeStatusEnum.none
      //       }
      //     }
      //   }))

      return {
        pagesCount: 1,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: 1,
        // items: commentsWithInfoAboutLikes
        items: []
      }
    } catch {
      return []
    }
  }

  async getById(id: string, userId?: string | null): Promise<any> {
    const query = `
      SELECT *
        FROM public.comments
        WHERE id = $1
    `
    const comments = await this.dataSource.query(query, [id])

    if (!comments[0]) {
      return null
    }

    return comments[0]
    // let myLike: ILike | null = null
    // const comment = await this.commentsModel.findOne({ id }, { _id: 0, __v: 0 })

    // if (!comment) {
    //   return null
    // }

    // const likesCounts = await this.likeRepository.getLikesCountsBySourceId(id)

    // if (userId) {
    //   myLike = await this.likeRepository.getLikeBySourceIdAndAuthorId({
    //     sourceId: id,
    //     authorId: userId
    //   })
    // }

    // return {
    //   id: comment.id,
    //   commentatorInfo: {
    //     userId: comment.authorInfo.userId,
    //     userLogin: comment.authorInfo.userLogin,
    //   },
    //   content: comment.content,
    //   createdAt: comment.createdAt,
    //   likesInfo: {
    //     likesCount: likesCounts?.likesCount ?? 0,
    //     dislikesCount: likesCounts?.dislikesCount ?? 0,
    //     myStatus: myLike?.status ?? LikeStatusEnum.none
    //   }
    // }
  }

  async createComment(data: ICreateCommentType) {
    const query = `
      INSERT INTO public.comments(
        "content", "authorId", "sourceId"
      )
        VALUES ($1, $2, $3)
        RETURNING "content", "authorId", "sourceId", "createdAt"
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

  save(comment: CommentDocument) {
    return comment.save()
  }
}
