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

import { CreatePostByBlogIdDto, CreatePostDto } from '../dtos/posts/create-post.dto'
import { ResponseBody, RequestParams } from '../types/request'
import { UpdatePostDto } from '../dtos/posts/update-post.dto'
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUserId } from '../auth/current-user-id.param.decorator'
import { appMessages } from '../constants/messages'
import { JWTService } from '../jwt/jwt.service'
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard'
import { LikeDto } from '../dtos/like/like.dto'
import { IExtendedPost } from '../types/posts'
import { RoutesEnum } from '../constants/global'
import { CommentDto } from '../dtos/comments/create-comment.dto'
import { IExtendedComment } from '../types/comments'
import { QuestionsRepository } from './questions.repository'
import { UsersRepository } from '../users/users.repository'
import { CommentsRepository } from '../comments/comments.repository'

@SkipThrottle()
@Controller(RoutesEnum.posts)
export class QuestionsController {
  constructor(
    private questionsRepository: QuestionsRepository,
    // private usersRepository: UsersRepository,
    private JWTService: JWTService,
    // private CommentsRepository: CommentsRepository,
  ) {}

  @Get()
  async getAll(
    @Query() query: RequestParams,
    @Req() req: Request,
  ): Promise<ResponseBody<IExtendedPost> | []> {
    let currentUserId: string | null = null

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      const { userId } = this.JWTService.verifyAccessToken(token)
      currentUserId = userId || null
    }

    // const posts = await this.postsRepository.getAll(query, currentUserId)

    return []
  }

  @Get(':postId/comments')
  async getCommentsByPostId(
    @Param() params: { postId: string },
    @Query() query: RequestParams,
    @Req() req: Request,
  ): Promise<ResponseBody<IExtendedComment> | []> {
    const postId = params.postId

    if (!postId) {
      throw new HttpException(
        { message: appMessages(appMessages().postId).errors.isRequiredField },
        HttpStatus.NOT_FOUND
      )
    }

    // const post = await this.postsRepository.getByIdWithLikes(postId)
    const post = null

    if (!post) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    let currentUserId: string | null = null

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      const { userId } = this.JWTService.verifyAccessToken(token)
      currentUserId = userId || null
    }

    return []
  }

  @Get(':id')
  async getPostById(
    @Param() params: { id: string },
    @Req() req: Request,
  ): Promise<IExtendedPost | null> {
    let currentUserId: string | undefined

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      const { userId } = this.JWTService.verifyAccessToken(token)
      currentUserId = userId
    }

    // const post = await this.postsRepository.getByIdWithLikes(
    //   params.id,
    //   currentUserId
    // )
    const post = null

    if (!post) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    return post
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async creatPost(@Body() data: CreatePostByBlogIdDto): Promise<any> {
    if (!data.blogId) {
      throw new HttpException(
        { message: appMessages(appMessages().blogId).errors.isRequiredField },
        HttpStatus.BAD_REQUEST
      )
    }

    const blog: any = {}

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const creatingData = {
      ...data,
      blogId: blog.id,
      blogName: blog.name
    }

    return null
  }
}
