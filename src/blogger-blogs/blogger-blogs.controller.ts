import { SkipThrottle } from '@nestjs/throttler'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { Request } from 'express'

import { BlogsRequestParams } from '../types/blogs'
import { RequestParams, ResponseBody } from '../types/request'
import { IBlog } from '../types/blogs'
import { appMessages } from '../constants/messages'
import { IExtendedPost } from '../types/posts'
import { JWTService } from '../jwt/jwt.service'
import { RoutesEnum } from '../constants/global'
import { PostsRepository } from '../posts/posts.repository'
import { BlogsRepository } from '../blogs/blogs.repository'
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateBlogDto } from '../dtos/blogs/create-blog.dto'
import { CurrentUserId } from '../auth/current-user-id.param.decorator'
import { UsersRepository } from '../users/users.repository'
import { UpdateBlogDto } from '../dtos/blogs/update-blog.dto'
import { CreatePostDto } from '../dtos/posts/create-post.dto'
import { UpdatePostDto } from '../dtos/posts/update-post.dto'

@SkipThrottle()
@Controller(RoutesEnum.bloggerBlogs)
export class BlogsController {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private JWTService: JWTService,
  ) {}

  @Get()
  @UseGuards(JWTAuthGuard)
  async getAll(
    @Query() query: BlogsRequestParams,
    @CurrentUserId() userId: string
  ): Promise<ResponseBody<IBlog> | []> {
    const blogs = await this.blogsRepository.getAll(query, userId)

    return blogs
  }

  @Get(':id')
  async getBlogById(@Param() params: { id: string }): Promise<IBlog | null> {
    const blog = await this.blogsRepository.getById(params.id)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    return blog
  }

  @Post()
  @UseGuards(JWTAuthGuard)
  async creatBlog(
    @Body() data: CreateBlogDto,
    @CurrentUserId() userId: string
  ): Promise<IBlog | null> {
    return this.blogsRepository.createBlog(data, userId)
  }

  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Query() query: RequestParams,
    @Param() params: { blogId: string },
    @Req() req: Request
  ): Promise<ResponseBody<IExtendedPost> | []> {
    let currentUserId: string | null = null

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

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      try {
        const { userId } = this.JWTService.verifyAccessToken(token)

        currentUserId = userId || null
      } catch {
        currentUserId = null
      }
    }

    const posts = await this.postsRepository.getAll(query, currentUserId, blog.id)

    return posts
  }

  @Put(':id')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param() params: { id: string },
    @Body() data: UpdateBlogDto,
    @CurrentUserId() userId: string
  ): Promise<any> {
    if (!params.id) {
      throw new HttpException(
        { message: appMessages(appMessages().blogId).errors.isRequiredField },
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

    const blog = await this.blogsRepository.getById(params.id)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(params.id, userId)

    if (!blogOfUser) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.FORBIDDEN
      )
    }

    const updatedBlog = await this.blogsRepository.updateBlog(
      params.id,
      data,
      userId,
    )

    if (!updatedBlog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param() params: { id: string },
    @CurrentUserId() userId: string
  ): Promise<any> {
    const user = await this.usersRepository.getById(userId)

    if (!user) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound },
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

    const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(params.id, userId)

    if (!blogOfUser) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.FORBIDDEN
      )
    }

    await this.blogsRepository.deleteBlogByOwner(params.id, userId)
  }

  @Post(':blogId/posts')
  @UseGuards(JWTAuthGuard)
  async creatPostByBlogId(
    @Param() params: { blogId: string },
    @Body() data: CreatePostDto,
    @CurrentUserId() userId: string
  ): Promise<IExtendedPost | null> {
    const blog = await this.blogsRepository.getById(params.blogId)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(params.blogId, userId)

    if (!blogOfUser) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.FORBIDDEN
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

  @Put(':blogId/posts/:postId')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() params: { blogId: string, postId: string },
    @Body() data: UpdatePostDto,
    @CurrentUserId() userId: string
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

    const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(params.blogId, userId)

    if (!blogOfUser) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.FORBIDDEN
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
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param() params: { blogId: string, postId: string },
    @CurrentUserId() userId: string
  ): Promise<any> {
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

    const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(params.blogId, userId)

    if (!blogOfUser) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.FORBIDDEN
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
}
