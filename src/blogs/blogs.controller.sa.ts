import { SkipThrottle } from '@nestjs/throttler'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  HttpCode,
  UseGuards,
  Req
} from '@nestjs/common'
import { Request } from 'express'
import { DataSource } from 'typeorm'
import { InjectDataSource } from '@nestjs/typeorm'

import { CreateBlogDto } from '../dtos/blogs/create-blog.dto'
import { BlogsRequestParams } from '../types/blogs'
import { RequestParams, ResponseBody } from '../types/request'
import { CreatePostDto } from '../dtos/posts/create-post.dto'
import { IBlog } from '../types/blogs'
import { UpdateBlogDto } from '../dtos/blogs/update-blog.dto'
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard'
import { appMessages } from '../constants/messages'
import { IExtendedPost } from '../types/posts'
import { RoutesEnum } from '../constants/global'
import { UpdatePostDto } from '../dtos/posts/update-post.dto'
import { BlogsRepository } from './blogs.repository'
import { PostsRepository } from '../posts/posts.repository'
import { UsersRepository } from '../users/users.repository'
import { BanBlogSADto } from '../dtos/blogs/ban-blog.dto'
import { GetUserIdFromTokenUserUseCase } from '../use-cases/get-user_id-from-token.use-case'

@SkipThrottle()
@Controller(RoutesEnum.saBlogs)
export class BlogsSAController {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private getUserIdFromTokenUserUseCase: GetUserIdFromTokenUserUseCase
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAll(
    @Query() query: BlogsRequestParams
  ): Promise<ResponseBody<IBlog> | []> {
    const blogs = await this.blogsRepository.getAllBySA(query)

    return blogs
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async creatBlog(@Body() data: CreateBlogDto): Promise<IBlog | null> {
    return this.blogsRepository.createBlog(data)
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param() params: { id: string },
    @Body() data: UpdateBlogDto
  ): Promise<any> {
    if (!params.id) {
      throw new HttpException(
        { message: appMessages(appMessages().blogId).errors.isRequiredField },
        HttpStatus.NOT_FOUND
      )
    }

    const blog = await this.blogsRepository.getById(params.id)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const updatedBlog = await this.blogsRepository.updateBlog(
      params.id,
      data,
    )

    if (!updatedBlog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param() params: { id: string }): Promise<any> {
    const blog = await this.blogsRepository.getById(params.id)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    await this.blogsRepository.deleteBlog(params.id)
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async creatPostByBlogId(
    @Param() params: { blogId: string },
    @Body() data: CreatePostDto
  ): Promise<IExtendedPost | null> {
    const blog = await this.blogsRepository.getById(params.blogId)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const newPost = await  this.postsRepository.createPost({
      ...data,
      blogId: blog.id
    })

    if (!newPost) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const post = await this.postsRepository.getByIdWithLikes(newPost.id)

    return post
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

    if (!!blog.isBanned) {
      return []
    }

    const currentUserId = this.getUserIdFromTokenUserUseCase.execute(req)

    const posts = await this.postsRepository.getAll(
      query,
      currentUserId,
      blog.id
    )

    return posts
  }

  @Put(':blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() params: { blogId: string, postId: string },
    @Body() data: UpdatePostDto
  ): Promise<undefined> {
    if (!params.postId) {
      throw new HttpException(
        { message: appMessages(appMessages().postId).errors.isRequiredField },
        HttpStatus.NOT_FOUND
      )
    }

    if (!params.blogId) {
      throw new HttpException(
        { message: appMessages(appMessages().blogId).errors.isRequiredField },
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

    const post = await this.postsRepository.getById(params.postId)

    if (!post) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const updatedPost = await this.postsRepository.updatePost(params.postId, data)

    if (!updatedPost) {
      throw new HttpException({ message: appMessages(appMessages().post).errors.notFound }, HttpStatus.NOT_FOUND)
    }
  }

  @Delete(':blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param() params: { blogId: string, postId: string }): Promise<any> {
    if (!params.postId) {
      throw new HttpException(
        { message: appMessages(appMessages().postId).errors.isRequiredField },
        HttpStatus.NOT_FOUND
      )
    }

    if (!params.blogId) {
      throw new HttpException(
        { message: appMessages(appMessages().blogId).errors.isRequiredField },
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

    const post = await this.postsRepository.getById(params.postId)

    if (!post) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    await this.postsRepository.deletePost(params.postId)
  }

  @Put(':id/bind-with-user/:userId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindBlogToUser(
    @Param() params: { id: string, userId: string },
  ): Promise<any> {
    const { id, userId } = params

    if (!id) {
      throw new HttpException(
        { message: appMessages(appMessages().blogId).errors.isRequiredField },
        HttpStatus.NOT_FOUND
      )
    }

    const blog = await this.blogsRepository.getById(id)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const user = await this.usersRepository.getById(userId)

    if (!user) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const updatedBlog = await this.blogsRepository.bindBlog(
      id,
      userId,
    )

    if (!updatedBlog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Put('/:blogId/ban')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUnbanUserForBlog(
    @Param() params: { blogId: string },
    @Body() data: BanBlogSADto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()
      const manager = queryRunner.manager

      const blog = await this.blogsRepository.getByIdWithBan(params.blogId)

      if (!blog) {
        throw new HttpException(
          { message: appMessages(appMessages().blog).errors.notFound },
          HttpStatus.NOT_FOUND
        )
      }

      if (blog.isBanned === data.isBanned) {
        return null
      }

      await this.blogsRepository.banUnbanBlog(params.blogId, data.isBanned, manager)

      await queryRunner.commitTransaction()
    } catch (err) {
      await queryRunner.rollbackTransaction()

      throw new HttpException(
        {
          message: err.message || appMessages().errors.somethingIsWrong,
          field: ''
        },
        err.status || HttpStatus.BAD_REQUEST
      )
    } finally {
      await queryRunner.release()
    }
  }
}

