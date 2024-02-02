import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'

import { RequestParams, ResponseBody } from '../types/request'
import {
  IExtendedComment,
  ICreateCommentType,
  ICreatedComment,
  IUpdateCommentType
} from '../types/comments'
import { IExtendedLike } from '../types/likes'
import {
  LENGTH_OF_NEWEST_LIKES_FOR_POST,
  LikeSourceTypeEnum,
  LikeStatusEnum
} from '../constants/likes'
import { SortDirections, SortType } from '../constants/global'
import { LikesRepository } from '../likes/likes.repository'
import { CommentEntity } from '../entities/comment'
import { UserEntity } from 'src/entities/user'

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

      const query = this.dataSource
        .createQueryBuilder()
        .where('comment.sourceId = :sourceId', { sourceId })
        .select('comment.*')
        .addSelect((subQuery) => {
          return subQuery
            .select('user.login', 'userLogin')
            .from(UserEntity, 'user')
            .where('comment.authorId = user.id')
        }, 'userLogin')
        .from(CommentEntity, 'comment')
        .addOrderBy(
          `comment.${sortBy}`,
          sortDirection?.toLocaleUpperCase() as SortType
        )
        .skip(skip)
        .take(pageSizeNumber)

      const comments = await query.getRawMany()
      const count = await query.getCount()
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const commentsWithInfoAboutLikes = await Promise.all(
        comments.map(async (comment) => {
          // const likesCounts =
          //   await this.likeSqlRepository.getLikesCountsBySourceId(
          //     LikeSourceTypeEnum.comments,
          //     comment.id
          //   )

          // let likesUserInfo

          // if (userId) {
          //   likesUserInfo = await this.likeSqlRepository.getLikeBySourceIdAndAuthorId({
          //     sourceType: LikeSourceTypeEnum.comments,
          //     sourceId: comment.id,
          //     authorId: userId})
          // }

          return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            commentatorInfo: {
              userId: comment.authorId,
              userLogin: comment.userLogin
              // userLogin: comment.userLogin,
            },
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: LikeStatusEnum.none
              // likesCount: likesCounts?.likesCount ?? 0,
              // dislikesCount: likesCounts?.dislikesCount ?? 0,
              // myStatus: likesUserInfo ? likesUserInfo.status : LikeStatusEnum.none
            }
          }
        })
      )

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

  async getById(
    id: string,
    userId?: string | null
  ): Promise<IExtendedComment | null> {
    // let myLike: IExtendedLike | null = null

    const query = this.dataSource.createQueryBuilder()

    const comment = await query
      .where('comment.id = :id', { id })
      .select('comment.*')
      .addSelect((subQuery) => {
        return subQuery
          .select('user.login', 'userLogin')
          .from(UserEntity, 'user')
          .where('comment.authorId = user.id')
      }, 'userLogin')
      .from(CommentEntity, 'comment')
      .getRawOne()

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
        userLogin: comment.userLogin
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

  async createComment(
    data: ICreateCommentType
  ): Promise<IExtendedComment | null> {
    try {
      const query = this.commentsRepo.createQueryBuilder('comment')

      const newComment = await query
        .insert()
        .values({
          content: data.content,
          authorId: data.userId,
          sourceId: data.sourceId
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
  }

  async updateComment(data: IUpdateCommentType): Promise<boolean> {
    const updatedComment = await this.commentsRepo
      .createQueryBuilder('comment')
      .update()
      .set({
        content: data.content
      })
      .where('id = :id', {
        id: data.id
      })
      .execute()

    if (!updatedComment.affected) {
      return false
    }

    return true
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
  }
}
