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
  UseGuards
} from '@nestjs/common'
import { BlogsRepository } from './blogs.repository'
import { BlogDocument } from './blogs.schema'
import { CreateBlogDto } from '../dtos/blogs/create-blog.dto'
import { BlogsRequestParams } from '../types/blogs'
import { RequestParams, ResponseBody } from '../types/request'
import { CreatePostDto } from '../dtos/posts/create-post.dto'
import { IBlog } from './types/blog'
import { PostsRepository } from '../posts/posts.repository'
import { IPost } from '../posts/types/post'
import { UpdateBlogDto } from '../dtos/blogs/update-blog.dto'
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard'

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository
  ) {}

  @Get()
  async getAll(
    @Query() query: BlogsRequestParams
  ): Promise<ResponseBody<BlogDocument> | []> {
    const blogs = await this.blogsRepository.getAll(query)

    return blogs
  }

  @Get(':id')
  async getBlogById(@Param() params: { id: string }): Promise<IBlog | null> {
    const blog = await this.blogsRepository.getById(params.id)

    if (!blog) {
      throw new HttpException({ message: "Blog doesn't exist" }, HttpStatus.NOT_FOUND)
    }

    return blog
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async creatBlog(@Body() data: CreateBlogDto): Promise<IBlog> {
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
      throw new HttpException({ message: "Blog id is required field" }, HttpStatus.NOT_FOUND)
    }

    const blog = await this.blogsRepository.getById(params.id)

    if (!blog) {
      throw new HttpException({ message: "Blog doesn't exist" }, HttpStatus.NOT_FOUND)
    }

    const updatedBlog = await this.blogsRepository.updateBlog(params.id, data)

    if (!updatedBlog) {
      throw new HttpException({ message: "Blog doesn't exist" }, HttpStatus.NOT_FOUND)
    }
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param() params: { id: string }): Promise<any> {
    const blog = await this.blogsRepository.getById(params.id)

    if (!blog) {
      throw new HttpException({ message: "Blog doesn't exist" }, HttpStatus.NOT_FOUND)
    }

    await this.blogsRepository.deleteBlog(params.id)
  }

  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Query() query: RequestParams,
    @Param() params: { blogId: string }
  ): Promise<ResponseBody<IPost> | []> {
    const blog = await this.blogsRepository.getById(params.blogId)

    if (!blog) {
      throw new HttpException({ message: "Blog doesn't exist" }, HttpStatus.NOT_FOUND)
    }

    const posts = await this.postsRepository.getAll(query, blog.id)

    return posts
  }

  @Post(':blogId/posts')
  async creatPostByBlogId(
    @Param() params: { blogId: string },
    @Body() data: CreatePostDto
  ): Promise<IPost | null> {
    const blog = await this.blogsRepository.getById(params.blogId)

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
}
