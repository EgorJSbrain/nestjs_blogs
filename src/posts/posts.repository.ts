import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostDocument } from './posts.schema';
import { CreatePostDto } from 'src/dtos/posts/create-post.dto';
import { RequestParams, ResponseBody, SortDirections } from 'src/typing/request';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postsModel: Model<PostDocument>) {}

  async getAll(params: RequestParams): Promise<ResponseBody<PostDocument> | []>  {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10,
      } = params
  
      const filter: FilterQuery<PostDocument> = {}
      const sort: Record<string, SortOrder> = {}

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
        .exec()
      
      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: posts
      }
    } catch {
      return []
    }
  }

  getById(id: string) {
    return this.postsModel.findById(id)
  }

  createPost(data: CreatePostDto) {
    const newPost = new this.postsModel(data)
    newPost.setDateOfCreatedAt()
    newPost.setId()

    return newPost.save()
  }

  deletePost(id: string) {
    return this.postsModel.deleteOne({ id })
  }

  save(post: PostDocument) {
    return post.save()
  }
}
