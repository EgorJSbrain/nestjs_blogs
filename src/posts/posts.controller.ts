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
import { LikeSourceTypeEnum, LikeStatusEnum } from '../constants/likes'
import { IExtendedComment } from '../types/comments'
import { PostsRepository } from './posts.repository'
import { LikesRepository } from '../likes/likes.repository'
import { UsersRepository } from '../users/users.repository'
import { CommentsRepository } from '../comments/comments.repository'

@SkipThrottle()
@Controller(RoutesEnum.posts)
export class PostsController {
  constructor(
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private JWTService: JWTService,
    private LikesRepository: LikesRepository,
    private CommentsRepository: CommentsRepository,
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

    const posts = await this.postsRepository.getAll(query, currentUserId)

    return posts
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

    const post = await this.postsRepository.getByIdWithLikes(postId)

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

    const comments = await this.CommentsRepository.getAll(query, postId, currentUserId)

    return comments
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

    const post = await this.postsRepository.getByIdWithLikes(params.id, currentUserId)

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

    return this.postsRepository.createPost(creatingData)
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() params: { id: string },
    @Body() data: UpdatePostDto
  ): Promise<undefined> {
    if (!params.id) {
      throw new HttpException(
        { message: appMessages(appMessages().postId).errors.isRequiredField },
        HttpStatus.NOT_FOUND
      )
    }

    const post = await this.postsRepository.getById(params.id)

    if (!post) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const updatedPost = await this.postsRepository.updatePost(params.id, data)

    if (!updatedPost) {
      throw new HttpException({ message: appMessages(appMessages().post).errors.notFound }, HttpStatus.NOT_FOUND)
    }
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param() params: { id: string }): Promise<any> {
    const post = await this.postsRepository.getById(params.id)

    if (!post) {
      throw new HttpException({ message: appMessages(appMessages().post).errors.notFound }, HttpStatus.NOT_FOUND)
    }

    await this.postsRepository.deletePost(params.id)
  }

  // @Get(':id/posts')
  // async getPostsByPostId(
  //   @Param() params: { id: string }
  // ): Promise<IExtendedPost | null> {
  //   const post = await this.postsRepository.getById(params.id)

  //   return null
  // }

  @Post()
  async creatPostByPostId(@Body() data: CreatePostDto): Promise<any> {
    return this.postsRepository.createPost(data)
  }

  @Put('/:postId/like-status')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async likePostById(
    @Param() params: { postId: string },
    @CurrentUserId() currentUserId: string,
    @Body() data: LikeDto
  ): Promise<undefined> {
    const existedUser = await this.usersRepository.getById(currentUserId)

    if (!existedUser) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const existedPost = await this.postsRepository.getById(params.postId)

    if (!existedPost) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const like = await this.LikesRepository.likeEntity(
      data.likeStatus,
      params.postId,
      LikeSourceTypeEnum.posts,
      existedUser?.id,
    )

    if (!like) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Post('/:postId/comments')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommentByPost(
    @Param() params: { postId: string },
    @CurrentUserId() currentUseruserId: string,
    @Body() data: CommentDto
  ): Promise<any> {
    const existedUser = await this.usersRepository.getById(currentUseruserId)

    if (!existedUser) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const existedPost = await this.postsRepository.getById(params.postId)

    if (!existedPost) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const comment = await this.CommentsRepository.createComment({
      content: data.content,
      userId: existedUser.id,
      sourceId: existedPost.id
    })

    if (!comment) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: '',
        // userId: comment.authorId,
        userLogin: existedUser.login
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.none
      }
    }
  }
}
