import { SkipThrottle } from '@nestjs/throttler'
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { Request } from 'express'

import { BlogsRequestParams, IBlogWithImages } from '../types/blogs'
import { RequestParams, ResponseBody } from '../types/request'
import { IBlog } from '../types/blogs'
import { appMessages } from '../constants/messages'
import { IExtendedPost } from '../types/posts'
import { RoutesEnum } from '../constants/global'
import { BlogsRepository } from './blogs.repository'
import { PostsRepository } from '../posts/posts.repository'
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUserId } from '../auth/current-user-id.param.decorator'
import { SubscriptionStatusEnum } from '../enums/SubscriptionStatusEnum'
import { GetUserIdFromTokenUserUseCase } from 'src/use-cases/get-user_id-from-token.use-case'

@SkipThrottle()
@Controller(RoutesEnum.blogs)
export class BlogsController {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private getUserIdFromTokenUserUseCase: GetUserIdFromTokenUserUseCase
  ) {}

  @Get()
  async getAll(
    @Query() query: BlogsRequestParams,
    @Req() req: Request
  ): Promise<ResponseBody<IBlog> | []> {
    const currentUserId = this.getUserIdFromTokenUserUseCase.execute(req)

    const blogs = await this.blogsRepository.getAll({
      params: query,
      ownerId: undefined,
      userId: currentUserId
    })

    return blogs
  }

  @Get(':id')
  async getBlogById(
    @Param() params: { id: string },
    @Req() req: Request
  ): Promise<IBlogWithImages | null> {
    const currentUserId = this.getUserIdFromTokenUserUseCase.execute(req)

    const blog = await this.blogsRepository.getByIdWithImages(params.id, currentUserId)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    return blog
  }

  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Query() query: RequestParams,
    @Param() params: { blogId: string },
    @Req() req: Request
  ): Promise<ResponseBody<IExtendedPost> | []> {
    if (!params.blogId) {
      throw new HttpException(
        {
          message: appMessages(appMessages().blogId).errors.isRequiredParameter,
          field: ''
        },
        HttpStatus.NOT_FOUND
      )
    }

    const blog = await this.blogsRepository.getById(params.blogId)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const currentUserId = this.getUserIdFromTokenUserUseCase.execute(req)

    const posts = await this.postsRepository.getAll(
      query,
      currentUserId,
      blog.id
    )

    return posts
  }

  @Post(':blogId/subscription')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JWTAuthGuard)
  async subscribeToBlog(
    @CurrentUserId() userId: string,
    @Param() params: { blogId: string }
  ) {
    const { blogId } = params

    if (!params.blogId) {
      throw new HttpException(
        {
          message: appMessages(appMessages().blogId).errors.isRequiredParameter,
          field: ''
        },
        HttpStatus.NOT_FOUND
      )
    }

    const blog = await this.blogsRepository.getByIdWithSubscriptionInfo(params.blogId, userId)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    if (blog.status === SubscriptionStatusEnum.Subscribed) {
      return
    } else if (blog.status === SubscriptionStatusEnum.Unsubscribed) {
      await this.blogsRepository.updateSubscribscriptionBlog(
        blogId,
        userId,
        SubscriptionStatusEnum.Subscribed
      )

      return
    }

    await this.blogsRepository.createSubscribscriptionBlog(blogId, userId)

    return
  }

  @Delete(':blogId/subscription')
  @UseGuards(JWTAuthGuard)
  async unsubscribeToBlog(
    @CurrentUserId() userId: string,
    @Param() params: { blogId: string }
  ) {
    const { blogId } = params

    if (!params.blogId) {
      throw new HttpException(
        {
          message: appMessages(appMessages().blogId).errors.isRequiredParameter,
          field: ''
        },
        HttpStatus.NOT_FOUND
      )
    }

    const blog = await this.blogsRepository.getById(params.blogId)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    await this.blogsRepository.updateSubscribscriptionBlog(
      blogId,
      userId,
      SubscriptionStatusEnum.Unsubscribed
    )
    return
  }
}
