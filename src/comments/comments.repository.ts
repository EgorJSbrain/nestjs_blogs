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

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentsModel: Model<CommentDocument>,
    private likeRepository: LikesRepository
    ) {}

  async getAll(
    params: RequestParams,
    sourceId: string,
    userId: string | null,
  ): Promise<ResponseBody<IComment> | []>  {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirectionsEnum.desc,
        pageNumber = 1,
        pageSize = 10,
      } = params

      const sort: Record<string, SortOrder> = {}
      let filter: FilterQuery<CommentDocument> = { sourceId }

      if (sortBy && sortDirection) {
        sort[sortBy] = sortDirection === SortDirectionsEnum.asc ? 1 : -1
      }

      if (userId) {
        filter = {
          ...filter,
         'authorInfo.userId': userId
        }
      }

      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber
      const count = await this.commentsModel.countDocuments(filter)
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const comments = await this.commentsModel
        .find(filter, { _id: 0, __v: 0 })
        .skip(skip)
        .limit(pageSizeNumber)
        .sort(sort)
        .exec()

        const commentsWithInfoAboutLikes = await Promise.all(comments.map(async (comment) => {
          const likesCounts = await this.likeRepository.getLikesCountsBySourceId(comment.id)

          let likesUserInfo

          if (userId) {
            likesUserInfo = await this.likeRepository.getLikeBySourceIdAndAuthorId({
              sourceId: comment.id,
              authorId: userId})
          }

          return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            commentatorInfo: {
              userId: comment.authorInfo.userId,
              userLogin: comment.authorInfo.userLogin,
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

  async getById(id: string, userId?: string | null): Promise<IComment | null>  {
    let myLike: ILike | null = null
    const comment = await this.commentsModel.findOne({ id }, { _id: 0, __v: 0 })

    if (!comment) {
      return null
    }

    const likesCounts = await this.likeRepository.getLikesCountsBySourceId(id)

    if (userId) {
      myLike = await this.likeRepository.getLikeBySourceIdAndAuthorId({
        sourceId: id,
        authorId: userId
      })
    }

    return {
      id: comment.id,
      commentatorInfo: {
        userId: comment.authorInfo.userId,
        userLogin: comment.authorInfo.userLogin,
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

  createComment(data: ICreateCommentType) {
    const newComment = new this.commentsModel(data)
    newComment.sourceId = data.sourceId
    // newComment.authorInfo = {
    //   userId: data.authorInfo.userId,
    //   userLogin: data.authorInfo.userLogin
    // }
    newComment.setDateOfCreatedAt()
    newComment.setId()

    return newComment.save()
  }

  async updateComment(data: IUpdateCommentType) {
    const existedComment = await this.commentsModel.findOne({ id: data.id })

    if (!existedComment) {
      return null
    }
    existedComment.content = data.content

    return existedComment.save()
  }

  deleteComment(id: string) {
    return this.commentsModel.deleteOne({ id })
  }

  save(comment: CommentDocument) {
    return comment.save()
  }
}
