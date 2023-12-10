import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostDocument } from './posts.schema';
import { CreatePostDto } from '../dtos/posts/create-post.dto';
import { RequestParams, ResponseBody, SortDirections } from '../types/request';
import { IPost } from './types/post';
import { UpdatePostDto } from '../dtos/posts/update-post.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postsModel: Model<PostDocument>) {}

  async getAll(params: RequestParams, blogId?: string): Promise<ResponseBody<IPost> | []>  {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10,
      } = params

      let filter: FilterQuery<PostDocument> = {}
      const sort: Record<string, SortOrder> = {}

      if (blogId) {
        filter = { blogId }
      }

      if (sortBy && sortDirection) {
        sort[sortBy] = sortDirection === SortDirections.asc ? 1 : -1
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

      const postsWithLikeinfo = posts.map((post) => ({
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: []
        }
      }))

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: postsWithLikeinfo
      }
    } catch {
      return []
    }
  }

  async getById(id: string): Promise<IPost | null> {
    const post = await this.postsModel.findOne({ id }, { _id: 0, __v: 0 })

    if (!post) {
      return null
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
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      }
    }
  }

  async createPost(data: CreatePostDto): Promise<IPost | null> {
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
        myStatus: 'None',
        newestLikes: [],
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

  // async likePost(postId: string): Promise<any> {
  //   const post = await this.postsModel.findOne({ id: postId })

  //   if (!post) {
  //     return null
  //   }

  //   // post.title = data.title ?? post.title
  //   // post.content = data.content ?? post.content
  //   // post.shortDescription = data.shortDescription ?? post.shortDescription

  //   post.save()

  //   return true
  // }

  deletePost(id: string) {
    return this.postsModel.deleteOne({ id })
  }

  save(post: PostDocument) {
    return post.save()
  }
}
