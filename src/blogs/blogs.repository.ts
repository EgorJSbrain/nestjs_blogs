import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogDocument } from './blogs.schema';
import { CreateBlogDto } from 'src/dtos/blogs/create-blog.dto';
import { RequestParams, ResponseBody, SortDirections } from 'src/types/request';
import { BlogsRequestParams } from '../../src/types/blogs';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogsModel: Model<BlogDocument>) {}

  async getAll(params: BlogsRequestParams): Promise<ResponseBody<BlogDocument> | []>  {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10,
        searchNameTerm,
      } = params
  
      const filter: FilterQuery<BlogDocument> = {}
      const sort: Record<string, SortOrder> = {}

      if (searchNameTerm) {
        filter.name = { $regex: searchNameTerm, $options: 'i' }
      }

      if (sortBy && sortDirection) {
        sort[sortBy] = sortDirection === SortDirections.asc ? 1 : -1
      }
  
      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber
      const count = await this.blogsModel.countDocuments(filter)
      const pagesCount = Math.ceil(count / pageSizeNumber)
  
      const blogs = await this.blogsModel
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
        items: blogs
      }
    } catch {
      return []
    }
  }

  getById(id: string) {
    return this.blogsModel.findById(id)
  }

  createBlog(data: CreateBlogDto) {
    const newBlog = new this.blogsModel(data)
    newBlog.setDateOfCreatedAt()
    newBlog.setId()

    return newBlog.save()
  }

  deleteBlog(id: string) {
    return this.blogsModel.deleteOne({ id })
  }

  save(blog: BlogDocument) {
    return blog.save()
  }
}
