import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { CreateBlogDto } from '../dtos/blogs/create-blog.dto';
import { ResponseBody } from '../types/request';
import { BlogsRequestParams, CreatingBlogData, IBlogForSA } from '../types/blogs';
import { IBlog } from '../types/blogs';
import { UpdateBlogDto } from '../dtos/blogs/update-blog.dto';
import { SortDirections, SortType } from '../constants/global';
import { BlogEntity } from '../entities/blog';
import { UserEntity } from '../entities/user';
import { appMessages } from '../constants/messages';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,

    @InjectRepository(BlogEntity)
    private readonly blogsRepo: Repository<BlogEntity>
  ) {}

  async getAll(
    params: BlogsRequestParams,
    ownerId?: string
  ): Promise<ResponseBody<IBlog> | []> {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10,
        searchNameTerm = ''
      } = params

      let whereFilter = ''
      let whereParams: Record<string, string> = {}
      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber

      const query = this.blogsRepo.createQueryBuilder('blog')

      if (searchNameTerm) {
        whereFilter = 'blog.name ILIKE :name'
        whereParams.name = `%${searchNameTerm}%`
      }

      if (ownerId) {
        whereFilter = `${whereFilter ? whereFilter + ' AND ' : ''} blog.ownerId = :ownerId`,
        whereParams.ownerId = ownerId
      }

      const searchObject = query
        .where(whereFilter, whereParams)
        .select('blog.*')
        .addOrderBy(
          `blog.${sortBy}`,
          sortDirection?.toLocaleUpperCase() as SortType
        )
        .skip(skip)
        .take(pageSizeNumber)

      const blogs = await searchObject.getRawMany<BlogEntity>()
      const count = await searchObject.getCount()
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const preparedBlogs = blogs.map(blog => ({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        isMembership: blog.isMembership,
        createdAt: blog.createdAt,
      }))

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: preparedBlogs
      }
    } catch(e) {
      throw new HttpException(
        { message: e.message || appMessages().errors.somethingIsWrong },
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async getAllBySA(
    params: BlogsRequestParams
  ): Promise<ResponseBody<IBlogForSA> | []> {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10,
        searchNameTerm = ''
      } = params

      let whereFilter = ''
      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber

      const query = this.blogsRepo.createQueryBuilder('blog')

      if (searchNameTerm) {
        whereFilter = 'blog.name ILIKE :name'
      }

      const searchObject = query
        .where(whereFilter, {
          name: searchNameTerm ? `%${searchNameTerm}%` : undefined
        })
        .select('blog.*')
        .addSelect((subQuery) => {
          return subQuery
            .select('user.login', 'userLogin')
            .from(UserEntity, 'user')
            .where('blog.ownerId = user.id')
        }, 'userLogin')
        .addOrderBy(
          `blog.${sortBy}`,
          sortDirection?.toLocaleUpperCase() as SortType
        )
        .skip(skip)
        .take(pageSizeNumber)

      const blogs = await searchObject.getRawMany()
      const count = await searchObject.getCount()
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const preparedBlogs = blogs.map(blog => ({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        blogOwnerInfo: {
          userId: blog.ownerId,
          userLogin: blog.userLogin
        }
      }))

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: preparedBlogs
      }
    } catch {
      return []
    }
  }

  async getById(id: string): Promise<BlogEntity | null> {
    const blog = this.blogsRepo
      .createQueryBuilder('blog')
      .select([
        'blog.id',
        'blog.name',
        'blog.description',
        'blog.websiteUrl',
        'blog.createdAt',
        'blog.isMembership',
      ])
      .where('blog.id = :id', { id })
      .getOne()

    if (!blog) {
      return null
    }

    return blog
  }

  async getByIdAndOwnerId(id: string, ownerId: string): Promise<BlogEntity | null> {
    const blog = this.blogsRepo
      .createQueryBuilder('blog')
      .select('blog.id')
      .where('blog.id = :id AND blog.ownerId = :ownerId', { id, ownerId })
      .getOne()

    if (!blog) {
      return null
    }

    return blog
  }

  async createBlog(data: CreateBlogDto, ownerId?: string): Promise<BlogEntity | null> {
    try {
      const query = this.blogsRepo.createQueryBuilder('blog')

      const valuesForCreating: CreatingBlogData = {
        name: data.name,
        description: data.description,
        websiteUrl: data.websiteUrl,
      }

      if (ownerId) {
        valuesForCreating.ownerId = ownerId
      }

      const newBlog = await query
        .insert()
        .values(valuesForCreating)
        .execute()

      const blog = await this.getById(newBlog.raw[0].id)

      if (!blog) {
        return null
      }

      return blog
    } catch {
      return null
    }
  }

  async updateBlog(blogId: string, data: UpdateBlogDto, ownerId?: string): Promise<boolean> {
    const whereParams: Record<string, string> = {
      id: blogId
    }

    let whereStr = 'id = :id'

    if (ownerId) {
      whereStr = 'id = :id AND ownerId = :ownerId'
      whereParams.ownerId = ownerId
    }

    const updatedBlog = await this.blogsRepo
        .createQueryBuilder('blog')
        .update()
        .set({ name: data.name, description: data.description, websiteUrl: data.websiteUrl })
        .where(whereStr, whereParams)
        .execute()

      if (!updatedBlog.affected) {
        return false
      }

      return true
  }

  async bindBlog(blogId: string, userId: string): Promise<boolean> {
    const updatedBlog = await this.blogsRepo
        .createQueryBuilder('blog')
        .update()
        .set({ ownerId: userId })
        .where('id = :id', {
          id: blogId
        })
        .execute()

      if (!updatedBlog.affected) {
        return false
      }

      return true
  }

  async deleteBlog(id: string) {
    try {
      const blog = await this.blogsRepo
        .createQueryBuilder('blog')
        .delete()
        .where('id = :id', { id })
        .execute()

      return !!blog.affected
    } catch (e) {
      return false
    }
  }

  async deleteBlogByOwner(id: string, ownerId: string) {
    try {
      const blog = await this.blogsRepo
        .createQueryBuilder('blog')
        .delete()
        .where('id = :id AND ownerId = :ownerId', { id, ownerId })
        .execute()

      return !!blog.affected
    } catch (e) {
      return false
    }
  }
}
