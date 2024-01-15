import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogDocument } from './blogs.schema';
import { CreateBlogDto } from '../dtos/blogs/create-blog.dto';
import { ResponseBody } from '../types/request';
import { BlogsRequestParams } from '../types/blogs';
import { IBlog } from '../types/blogs';
import { UpdateBlogDto } from '../dtos/blogs/update-blog.dto';
import { SortDirectionsEnum } from '../constants/global';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogsModel: Model<BlogDocument>) {}

  async getAll(params: BlogsRequestParams): Promise<ResponseBody<BlogDocument> | []>  {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirectionsEnum.desc,
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
        sort[sortBy] = sortDirection === SortDirectionsEnum.asc ? 1 : -1
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
        items: []
      }
    } catch {
      return []
    }
  }

  async getById(id: string): Promise<IBlog | null> {
    const blog = await this.blogsModel.findOne({ id })

    if (!blog) {
      return null
    }

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      isMembership: blog.isMembership,
      createdAt: blog.createdAt,
    }
  }

  async createBlog(data: CreateBlogDto): Promise<IBlog> {
    const newBlog = new this.blogsModel(data)
    newBlog.setDateOfCreatedAt()
    newBlog.setId()

    const createdBlog = await newBlog.save()

    return {
      id: createdBlog.id,
      name: createdBlog.name,
      description: createdBlog.description,
      websiteUrl: createdBlog.websiteUrl,
      isMembership: createdBlog.isMembership,
      createdAt: createdBlog.createdAt,
    }
  }

  async updateBlog(id: string, data: UpdateBlogDto): Promise<any> {
    const blog = await this.blogsModel.findOne({ id })

    if (!blog) {
      return null
    }

    blog.name = data.name ?? blog.name
    blog.description = data.description ?? blog.description
    blog.websiteUrl = data.websiteUrl ?? blog.websiteUrl

    blog.save()

    return true
  }

  async deleteBlog(id: string) {
    return await this.blogsModel.deleteOne({ id })
  }

  save(blog: BlogDocument) {
    return blog.save()
  }
}
