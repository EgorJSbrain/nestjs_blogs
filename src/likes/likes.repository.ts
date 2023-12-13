import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Like, LikeDocument } from './likes.schema';
import { LikeStatusEnum } from '../constants/like';
import { ILike, ILikesInfo, LikesRequestParams } from '../types/likes';
import { CreateLikeDto } from '../dtos/like/create-like.dto';

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Like.name) private likesModel: Model<LikeDocument>) {}

  async getLikesCountsBySourceId(sourceId: string): Promise<ILikesInfo | null> {
    try {
      const filter: FilterQuery<ILikesInfo> = { sourceId }

      const likesCount = await this.likesModel.countDocuments({
        ...filter,
        status: LikeStatusEnum.like
      })
      const dislikesCount = await this.likesModel.countDocuments({
        ...filter,
        status: LikeStatusEnum.dislike
      })

      return {
        sourceId,
        dislikesCount,
        likesCount
      }
    } catch {
      return null
    }
  }

  async getSegmentOfLikesByParams(
    sourceId: string,
    limit: number,
    authorId?: string
  ): Promise<ILike[]> {
    try {
      let filter: FilterQuery<ILikesInfo> = {
        sourceId,
        status: LikeStatusEnum.like
      }

      if (authorId) {
        filter = {
          $and: [{ sourceId }, { authorId }],
          status: LikeStatusEnum.like
        }
      }

      const count = await this.likesModel.countDocuments(filter)
      const countForSkiping = count < limit ? 0 : count - limit

      const newLikes = await this.likesModel
        .find(filter, { _id: 0, __v: 0 })
        .sort({ createdAt: 1 })
        .skip(countForSkiping)

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
    } catch {
      return []
    }
  }

  async createLike(data: CreateLikeDto): Promise<boolean> {
    const newLike = new this.likesModel(data)
    newLike.setDateOfCreatedAt()
    newLike.setId()

    const createdLike = await newLike.save()

    if (!createdLike) {
      return false
    }

    return !!createdLike
  }

  async updateLike(id: string, likeStatus: LikeStatusEnum): Promise<boolean> {
    const like = await this.likesModel.findOne({ id })

    if (!like) {
      return false
    }

    like.status = likeStatus ?? like.status

    like.save()

    return true
  }

  async getLikeBySourceIdAndAuthorId(
    params: LikesRequestParams
  ): Promise<LikeDocument | null> {
    try {
      const like = await this.likesModel.findOne(
        { sourceId: params.sourceId, authorId: params.authorId },
        { _id: 0 }
      ).lean()

      if (!like) {
        return null
      }

      return like
    } catch {
      return null
    }
  }

  async likeEntity(
    likeStatus: LikeStatusEnum,
    sourceId: string,
    authorId: string,
    userLogin: string
  ): Promise<boolean> {
    const like = await this.getLikeBySourceIdAndAuthorId({ sourceId, authorId })

    if (!like && (likeStatus === LikeStatusEnum.like || likeStatus === LikeStatusEnum.dislike)) {
      const newLike = await this.createLike({
        sourceId,
        authorId,
        status: likeStatus,
        login: userLogin
      })

      if (!newLike) {
        return false
      }
    }

    if (like && likeStatus !== like.status) {
      const updatedLike = await this.updateLike(like.id, likeStatus)

      if (!updatedLike) {
        return false
      }
    }

    return true
  }

  save(like: LikeDocument) {
    return like.save()
  }
}
