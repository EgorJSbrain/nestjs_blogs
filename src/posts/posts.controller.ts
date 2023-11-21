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
  HttpCode
} from '@nestjs/common'
import { PostsRepository } from './posts.repository'
import { Post as PostSchema, PostDocument } from './posts.schema'
import { CreatePostDto } from 'src/dtos/posts/create-post.dto'
import { ResponseBody, RequestParams } from '../types/request'
import { IPost } from './types/post'
import { BlogsRepository } from 'src/blogs/blogs.repository'
import { UpdatePostDto } from 'src/dtos/posts/update-post.dto'

@Controller('posts')
export class PostsController {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository
  ) {}

  @Get()
  async getAll(
    @Query() query: RequestParams
  ): Promise<ResponseBody<IPost> | []> {
    const posts = await this.postsRepository.getAll(query)

    return posts
  }

  @Get(':postId/comments')
  async getCommentsByPostId(
    @Query() query: RequestParams
  ): Promise<ResponseBody<IPost> | []> {
    const comments = await this.postsRepository.getAll(query)

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
      throw new HttpException({ message: "Blog id is requiered field" }, HttpStatus.BAD_REQUEST)
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
}
