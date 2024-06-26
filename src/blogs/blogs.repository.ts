import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { DataSource, EntityManager, Repository, UpdateResult } from 'typeorm'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'

import { CreateBlogDto } from '../dtos/blogs/create-blog.dto'
import { ResponseBody } from '../types/request'
import {
  BlogsRequestParams,
  CreatingBlogData,
  IBlogForSA,
  IBlogWithImages
} from '../types/blogs'
import { UpdateBlogDto } from '../dtos/blogs/update-blog.dto'
import { SortDirections, SortType } from '../constants/global'
import { BlogEntity } from '../entities/blog'
import { UserEntity } from '../entities/user'
import { appMessages } from '../constants/messages'
import { prepareFile } from '../utils/prepareFile'
import { FileEntity } from '../entities/files'
import { UsersBlogsEntity } from '../entities/users-blogs'
import { SubscriptionStatusEnum } from '../enums/SubscriptionStatusEnum'


type Params = {
  params: BlogsRequestParams,
  ownerId?: string
  userId?: string | null
}
@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,

    @InjectRepository(BlogEntity)
    private readonly blogsRepo: Repository<BlogEntity>,

    @InjectRepository(UsersBlogsEntity)
    private readonly usersBlogsRepo: Repository<UsersBlogsEntity>
  ) {}

  async getAll({
    params,
    ownerId,
    userId
  }: Params): Promise<ResponseBody<IBlogWithImages> | []> {
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
        if (ownerId) {
          whereFilter = `${
            whereFilter ? whereFilter + ' AND ' : ''
          } blog.ownerId = :ownerId`
          whereParams.ownerId = ownerId
        }
      }

      const searchObject = query
        .where(whereFilter, whereParams)
        .andWhere('blog.isBanned = NOT(true)')
        .select('blog.*')
        .addSelect((subQuery) => {
          return subQuery
            .select('json_agg(files)', 'wallpaper')
            .from(FileEntity, 'files')
            .where("files.blogId = blog.id AND files.type = 'wallpaper'")
        }, 'wallpaper')
        .addSelect((subQuery) => {
          return subQuery
            .select('json_agg(files)', 'main')
            .from(FileEntity, 'files')
            .where("files.blogId = blog.id AND files.type = 'main'")
        }, 'main')
        .addOrderBy(
          `blog.${sortBy}`,
          sortDirection?.toLocaleUpperCase() as SortType
        )
        .addSelect((subQuery) => {
          return subQuery
            .select('count(*)', 'allSubscriptionsCount')
            .from(UsersBlogsEntity, 'users_blogs')
            .where(
              "users_blogs.blogId = blog.id AND (users_blogs.status = 'Subscribed' OR users_blogs.status = 'Unsubscribed')"
            )
        }, 'allSubscriptionsCount')
        .addSelect((subQuery) => {
          return subQuery
            .select('count(*)', 'subscribersCount')
            .from(UsersBlogsEntity, 'users_blogs')
            .where(
              "users_blogs.blogId = blog.id AND users_blogs.status = 'Subscribed'",
              { userId }
            )
        }, 'subscribersCount')
        .skip(skip)
        .take(pageSizeNumber)

      if (userId) {
        searchObject.addSelect((subQuery) => {
          return subQuery
            .select('users_blogs.status', 'subscriptionStatus')
            .from(UsersBlogsEntity, 'users_blogs')
            .where(
              'users_blogs.userId = :userId AND users_blogs.blogId = blog.id',
              { userId }
            )
        }, 'subscriptionStatus')
      }

      const blogs = await searchObject.getRawMany()
      const count = await searchObject.getCount()
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const preparedBlogs = blogs.map((blog) => {
        const subscibersCount = Number(blog.subscribersCount)
        const allSubscibersCount =
          Number(blog.allSubscriptionsCount) === 0
            ? null
            : Number(blog.allSubscriptionsCount)

        const preparedBlog = {
          id: blog.id,
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          isMembership: blog.isMembership,
          createdAt: blog.createdAt,
          images: {
            wallpaper: blog.wallpaper ? prepareFile(blog.wallpaper[0]) : null,
            main: blog.main ? blog.main.map((main) => prepareFile(main)) : []
          },
          subscribersCount: subscibersCount,
          currentUserSubscriptionStatus: blog.subscriptionStatus
        }

        if (allSubscibersCount) {
          preparedBlog.subscribersCount = subscibersCount
        }

        return preparedBlog
      })

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: preparedBlogs
      }
    } catch (e) {
      console.log("🚀 ~ BlogsRepository ~ e:", e)
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

      if (searchNameTerm) {
        whereFilter = 'blog.name ILIKE :name'
      }

      const searchObject = this.blogsRepo
        .createQueryBuilder('blog')
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

      const preparedBlogs = blogs.map((blog) => ({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        blogOwnerInfo: {
          userId: blog.ownerId,
          userLogin: blog.userLogin
        },
        banInfo: {
          isBanned: blog.isBanned,
          banDate: blog.banDate
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
    const blog = await this.blogsRepo
      .createQueryBuilder('blog')
      .select([
        'blog.id',
        'blog.name',
        'blog.description',
        'blog.websiteUrl',
        'blog.createdAt',
        'blog.isMembership'
      ])
      .where('blog.id = :id AND blog.isBanned = NOT(true)', { id })
      .getOne()

    if (!blog) {
      return null
    }

    return blog
  }

  async getByIdWithSubscriptionInfo(
    id: string,
    userId: string
  ): Promise<any | null> {
    const query = this.blogsRepo
      .createQueryBuilder('blog')
      .select([
        'blog.id',
        'blog.name',
        'blog.description',
        'blog.websiteUrl',
        'blog.createdAt',
        'blog.isMembership'
      ])
      .where('blog.id = :id AND blog.isBanned = NOT(true)', { id })
      .addSelect((subQuery) => {
        return subQuery
          .select('users_blogs.status', 'status')
          .from(UsersBlogsEntity, 'users_blogs')
          .where('users_blogs.userId = :userId AND users_blogs.blogId = :id', {
            userId,
            id
          })
      }, 'status')

    const blog = await query.getRawOne()

    if (!blog) {
      return null
    }

    return blog
  }

  async getByIdWithImages(id: string, userId: string | null) {
    const query = this.blogsRepo
      .createQueryBuilder('blog')
      .select([
        'blog.id',
        'blog.name',
        'blog.description',
        'blog.websiteUrl',
        'blog.createdAt',
        'blog.isMembership'
      ])
      .where('blog.id = :id AND blog.isBanned = NOT(true)', { id })
      .addSelect((subQuery) => {
        return subQuery
          .select('json_agg(files)', 'wallpaper')
          .from(FileEntity, 'files')
          .where("files.blogId = blog.id AND files.type = 'wallpaper'")
      }, 'wallpaper')
      .addSelect((subQuery) => {
        return subQuery
          .select('json_agg(files)', 'main')
          .from(FileEntity, 'files')
          .where("files.blogId = blog.id AND files.type = 'main'")
      }, 'main')
      .addSelect((subQuery) => {
        return subQuery
          .select('count(*)', 'subscribersCount')
          .from(UsersBlogsEntity, 'users_blogs')
          .where(
            "users_blogs.blogId = :id AND users_blogs.status = 'Subscribed'",
            { id }
          )
      }, 'subscribersCount')

    if (userId) {
      query.addSelect((subQuery) => {
        return subQuery
          .select('users_blogs.status', 'status')
          .from(UsersBlogsEntity, 'users_blogs')
          .where('users_blogs.userId = :userId AND users_blogs.blogId = :id', {
            userId,
            id
          })
      }, 'status')
    }

    const blog = await query.getRawOne()

    if (!blog) {
      return null
    }

    return {
      id: blog.blog_id,
      name: blog.blog_name,
      description: blog.blog_description,
      websiteUrl: blog.blog_websiteUrl,
      createdAt: blog.blog_createdAt,
      isMembership: blog.blog_isMembership,
      images: {
        wallpaper: blog.wallpaper ? prepareFile(blog.wallpaper[0]) : null,
        main: blog.main ? blog.main.map((main) => prepareFile(main)) : []
      },
      currentUserSubscriptionStatus: blog.status
        ? blog.status
        : SubscriptionStatusEnum.None,
      subscribersCount: Number(blog.subscribersCount)
    }
  }

  async getByIdWithBan(id: string): Promise<BlogEntity | null> {
    const blog = this.blogsRepo
      .createQueryBuilder('blog')
      .select(['blog.id', 'blog.isBanned'])
      .where('blog.id = :id', { id })
      .getOne()

    if (!blog) {
      return null
    }

    return blog
  }

  async getByIdAndOwnerId(
    id: string,
    ownerId: string
  ): Promise<BlogEntity | null> {
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

  async createBlog(
    data: CreateBlogDto,
    ownerId?: string
    // TO DO add type
  ): Promise<any | null> {
    try {
      const query = this.blogsRepo.createQueryBuilder('blog')

      const valuesForCreating: CreatingBlogData = {
        name: data.name,
        description: data.description,
        websiteUrl: data.websiteUrl
      }

      if (ownerId) {
        valuesForCreating.ownerId = ownerId
      }

      const newBlog = await query.insert().values(valuesForCreating).execute()

      const blog = await this.getById(newBlog.raw[0].id)

      if (!blog) {
        return null
      }

      return {
        ...blog,
        images: {
          wallpaper: null,
          main: [],
        },
        currentUserSubscriptionStatus: null,
        subscribersCount: 0
      }
    } catch {
      return null
    }
  }

  async createSubscribscriptionBlog(blogId: string, userId: string) {
    console.log("---0----blogId:", blogId)
    console.log("---1---userId:", userId)
    const newSubscription = this.usersBlogsRepo.create()

    newSubscription.blogId = blogId
    newSubscription.userId = userId
    newSubscription.status = SubscriptionStatusEnum.Subscribed

    return await newSubscription.save()
  }

  async updateSubscribscriptionBlog(
    blogId: string,
    userId: string,
    status: SubscriptionStatusEnum
  ) {
    return this.usersBlogsRepo.update({ blogId, userId }, { status })
  }

  async getSubscribscriptionsByBlogId(blogId: string) {
    const subscriptions = await this.usersBlogsRepo.find({
      where: {
        blogId,
        status: SubscriptionStatusEnum.Subscribed
      },
      relations: {
        user: true
      }
    })

    return subscriptions
  }

  async updateBlog(
    blogId: string,
    data: UpdateBlogDto,
    ownerId?: string
  ): Promise<boolean> {
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
      .set({
        name: data.name,
        description: data.description,
        websiteUrl: data.websiteUrl
      })
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

  async banUnbanBlog(
    blogId: string,
    isBanned: boolean,
    manager: EntityManager
  ): Promise<UpdateResult | null> {
    try {
      const banDate = isBanned ? new Date().toISOString() : null

      const updatedBlog = await manager.update(
        BlogEntity,
        { id: blogId },
        { isBanned, banDate }
      )

      if (!updatedBlog) {
        return null
      }

      return updatedBlog
    } catch (e) {
      throw new Error(appMessages().errors.somethingIsWrong)
    }
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
