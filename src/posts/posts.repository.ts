import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostDocument } from './posts.schema';
import { RequestParams, ResponseBody } from '../types/request';
import { UpdatePostDto } from '../dtos/posts/update-post.dto';
import { LikesRepository } from '../likes/likes.repository';
import { LENGTH_OF_NEWEST_LIKES_FOR_POST } from '../constants/likes'
import { LikeStatusEnum } from '../constants/likes';
import { formatLikes } from '../utils/formatLikes';
import { ILike } from '../types/likes';
import { ICreatePostType, IPost } from '../types/posts';
import { SortDirectionsEnum } from '../constants/global';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postsModel: Model<PostDocument>,
    private likeRepository: LikesRepository
  ) {}

  async getAll(
    params: RequestParams,
    userId: string | null,
    blogId?: string
  ): Promise<ResponseBody<IPost> | []> {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirectionsEnum.desc,
        pageNumber = 1,
        pageSize = 10
      } = params

      let filter: FilterQuery<PostDocument> = {}
      const sort: Record<string, SortOrder> = {}

      if (blogId) {
        filter = { blogId }
      }

      if (sortBy && sortDirection) {
        sort[sortBy] = sortDirection === SortDirectionsEnum.asc ? 1 : -1
      }

      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber
      const count = await this.postsModel.countDocuments(filter)
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const posts = await this.postsModel
        .find(filter, { _id: 0, __v: 0 })
        .skip(skip)
        .limit(pageSizeNumber)
        .sort(sort)
        .lean()

      const postsWithInfoAboutLikes = await Promise.all(
        posts.map(async (post) => {
          const likesCounts = await this.likeRepository.getLikesCountsBySourceId(
            post.id
          )
          const newestLikes = await this.likeRepository.getSegmentOfLikesByParams(
            post.id,
            LENGTH_OF_NEWEST_LIKES_FOR_POST
          )

          let likesUserInfo

          if (userId) {
            likesUserInfo =
              await this.likeRepository.getLikeBySourceIdAndAuthorId({
                sourceId: post.id,
                authorId: userId
              })
          }

          return {
            ...post,
            extendedLikesInfo: {
              likesCount: likesCounts?.likesCount ?? 0,
              dislikesCount: likesCounts?.dislikesCount ?? 0,
              myStatus: likesUserInfo ? likesUserInfo.status : LikeStatusEnum.none,
              newestLikes: formatLikes(newestLikes)
            }
          }
        })
      )

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: postsWithInfoAboutLikes
      }
    } catch {
      return []
    }
  }

  async getById(id: string, userId?: string): Promise<IPost | null> {
    const post = await this.postsModel.findOne({ id }, { _id: 0, __v: 0 })
    let myLike: ILike | null = null

    if (!post) {
      return null
    }

    const likesCounts = await this.likeRepository.getLikesCountsBySourceId(post.id)
    const newestLikes = await this.likeRepository.getSegmentOfLikesByParams(post.id, LENGTH_OF_NEWEST_LIKES_FOR_POST)

    if (userId) {
      myLike = await this.likeRepository.getLikeBySourceIdAndAuthorId({
        sourceId: post.id,
        authorId: userId
      })
    }

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: likesCounts?.likesCount ?? 0,
        dislikesCount: likesCounts?.dislikesCount ?? 0,
        myStatus: myLike?.status ?? LikeStatusEnum.none,
        newestLikes: formatLikes(newestLikes)
      }
    }
  }

  async createPost(data: ICreatePostType): Promise<IPost | null> {
    const newPost = new this.postsModel(data)
    newPost.setDateOfCreatedAt()
    newPost.setId()

    const createdPost = await newPost.save()

    if (!createdPost) {
      return null
    }

    return {
      id: createdPost.id,
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      content: createdPost.content,
      blogId: createdPost.blogId,
      blogName: createdPost.blogName,
      createdAt: createdPost.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.none,
        newestLikes: []
      }
    }
  }

  async updatePost(id: string, data: UpdatePostDto): Promise<any> {
    const post = await this.postsModel.findOne({ id })

    if (!post) {
      return null
    }

    post.title = data.title ?? post.title
    post.content = data.content ?? post.content
    post.shortDescription = data.shortDescription ?? post.shortDescription

    post.save()

    return true
  }

  deletePost(id: string) {
    return this.postsModel.deleteOne({ id })
  }

  save(post: PostDocument) {
    return post.save()
  }
}
