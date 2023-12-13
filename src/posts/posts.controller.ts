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
import { PostsRepository } from './posts.repository'
import { Post as PostSchema, PostDocument } from './posts.schema'
import { CreatePostDto } from '../dtos/posts/create-post.dto'
import { ResponseBody, RequestParams } from '../types/request'
import { IPost } from './types/post'
import { BlogsRepository } from '../blogs/blogs.repository'
import { UpdatePostDto } from '../dtos/posts/update-post.dto'
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UsersRepository } from '../users/users.repository'
import { CurrentUserId } from '../auth/current-user-id.param.decorator'
import { appMessages } from '../constants/messages'
import { LikeStatusEnum } from '../constants/like'
import { JwtRepository } from '../jwt/jwt.repository'
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard'

@Controller('posts')
export class PostsController {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private usersRepository: UsersRepository,
    private jwtRepository: JwtRepository,
  ) {}

  @Get()
  async getAll(
    @Query() query: RequestParams,
    @Req() req: Request,
  ): Promise<ResponseBody<IPost> | []> {
    let currentUserId: string | null = null

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      const { userId } = this.jwtRepository.verifyAccessToken(token)
      currentUserId = userId || null
    }

    const posts = await this.postsRepository.getAll(query, currentUserId)

    return posts
  }

  @Get(':postId/comments')
  async getCommentsByPostId(
    @Query() query: RequestParams
  ): Promise<ResponseBody<IPost> | []> {
    const comments = await this.postsRepository.getAll(query, '')

    return comments
  }

  @Get(':id')
  async getPostById(@Param() params: { id: string }): Promise<IPost | null> {
    const post = await this.postsRepository.getById(params.id)

    if (!post) {
      throw new HttpException({ message: "Post doesn't exist" }, HttpStatus.NOT_FOUND)
    }

    return post
  }

  @Post()
  async creatPost(@Body() data: CreatePostDto): Promise<any> {
    if (!data.blogId) {
      throw new HttpException(
        { message: appMessages(appMessages().blogId).errors.isRequiredField },
        HttpStatus.BAD_REQUEST
      )
    }

    const blog = await this.blogsRepository.getById(data.blogId)

    if (!blog) {
      throw new HttpException({ message: "Blog doesn't exist" }, HttpStatus.NOT_FOUND)
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
      throw new HttpException({ message: "Post id is required field" }, HttpStatus.NOT_FOUND)
    }

    const post = await this.postsRepository.getById(params.id)

    if (!post) {
      throw new HttpException({ message: "Post doesn't exist" }, HttpStatus.NOT_FOUND)
    }

    const updatedPost = await this.postsRepository.updatePost(params.id, data)

    if (!updatedPost) {
      throw new HttpException({ message: "Post doesn't exist" }, HttpStatus.NOT_FOUND)
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param() params: { id: string }): Promise<any> {
    const post = await this.postsRepository.getById(params.id)

    if (!post) {
      throw new HttpException({ message: "Post doesn't exist" }, HttpStatus.NOT_FOUND)
    }

    await this.postsRepository.deletePost(params.id)
  }

  @Get(':id/posts')
  async getPostsByPostId(
    @Param() params: { id: string }
  ): Promise<PostSchema | null> {
    const post = await this.postsRepository.getById(params.id)

    return null
  }

  @Post()
  async creatPostByPostId(@Body() data: CreatePostDto): Promise<any> {
    return this.postsRepository.createPost(data)
  }

  @Put('/:postId/like-status')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async likePostById(
    @Param() params: { postId: string },
    @CurrentUserId() currentUseruserId: string,
    @Body() data: { likeStatus: LikeStatusEnum }
  ): Promise<undefined> {
    const exitedUser = await this.usersRepository.getById(currentUseruserId)

    if (!exitedUser) {
      throw new HttpException(
        { message: appMessages('User').errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const existedPost = await this.postsRepository.getById(params.postId)

    if (!existedPost) {
      throw new HttpException(
        { message: appMessages('Post').errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }
    // return this.postsRepository.likePost(postId)
  }
}
