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
import { CommentLikeEntity } from 'src/entities/comment-like'

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsRepo: Repository<CommentEntity>,

    @InjectDataSource() protected dataSource: DataSource,
    private likeRepository: LikesRepository,

    @InjectRepository(CommentLikeEntity)
    private readonly commentLikesRepo: Repository<CommentLikeEntity>
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
          return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            commentatorInfo: {
              userId: comment.authorId,
              userLogin: comment.userLogin
            },
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: LikeStatusEnum.none
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

    return {
      id: comment.id,
      commentatorInfo: {
        userId: comment.authorId,
        userLogin: comment.userLogin
      },
      content: comment.content,
      createdAt: comment.createdAt,
      likesInfo: {
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

  async likeComment(
    likeStatus: LikeStatusEnum,
    sourceId: string,
    authorId: string
  ) {
    try {
      const query = this.commentLikesRepo.createQueryBuilder(
        LikeSourceTypeEnum.comments
      )

      const like = await this.likeRepository.likeEntity(
        likeStatus,
        sourceId,
        LikeSourceTypeEnum.comments,
        authorId,
        query,
      )

      return like
    } catch (e) {
      return false
    }
  }
}
