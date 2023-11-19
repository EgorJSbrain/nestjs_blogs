import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { PostsRepository } from './posts.repository'
import { Post as PostSchema, PostDocument } from './posts.schema'
import { CreatePostDto } from 'src/dtos/posts/create-post.dto'
import { ResponseBody, RequestParams } from '../types/request'

@Controller('posts')
export class PostsController {
  constructor(private postsRepository: PostsRepository) {}

  @Get()
  async getAll(
    @Query() query: RequestParams
  ): Promise<ResponseBody<PostDocument> | []> {
    const posts = await this.postsRepository.getAll(query)

    return posts
  }

  @Get(':postId/comments')
  async getCommentsByPostId(
    @Query() query: RequestParams
  ): Promise<ResponseBody<PostDocument> | []> {
    const comments = await this.postsRepository.getAll(query)

    return comments
  }

  @Get(':id')
  async getPostById(@Param() params: { id: string }): Promise<PostSchema | null> {
    const post = await this.postsRepository.getById(params.id)

    return post
  }

  @Post()
  async creatPost(@Body() data: CreatePostDto): Promise<any> {
    return this.postsRepository.createPost(data)
  }

  @Put()
  async updatePost(@Body() data: CreatePostDto): Promise<any> {
    return this.postsRepository.createPost(data)
  }

  @Delete(':id')
  async deletePost(@Param() params: { id: string }): Promise<any> {
    return this.postsRepository.deletePost(params.id)
  }

  @Get(':id/posts')
  async getPostsByPostId(
    @Param() params: { id: string }
  ): Promise<PostSchema | null> {
    const post = await this.postsRepository.getById(params.id)

    return post
  }

  @Post()
  async creatPostByPostId(@Body() data: CreatePostDto): Promise<any> {
    return this.postsRepository.createPost(data)
  }
}
