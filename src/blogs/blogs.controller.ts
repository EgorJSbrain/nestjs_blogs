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
  Query
} from '@nestjs/common'
import { BlogsRepository } from './blogs.repository'
import { Blog, BlogDocument } from './blogs.schema'
import { CreateBlogDto } from 'src/dtos/blogs/create-blog.dto'
import { BlogsRequestParams } from '../types/blogs'
import { ResponseBody } from '../types/request'
import { CreatePostDto } from 'src/dtos/posts/create-post.dto'
import { IBlog } from './types/blog'
import { PostsRepository } from 'src/posts/posts.repository'

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

    return blog
  }

  @Post()
  async creatBlog(@Body() data: CreateBlogDto): Promise<IBlog> {
    return this.blogsRepository.createBlog(data)
  }

  @Put()
  async updateBlog(@Body() data: CreateBlogDto): Promise<any> {
    return this.blogsRepository.createBlog(data)
  }

  @Delete(':id')
  async deleteBlog(@Param() params: { id: string }): Promise<any> {
    return this.blogsRepository.deleteBlog(params.id)
  }

  // TODO rewrite logic
  @Get(':id/posts')
  async getPostsByBlogId(
    @Param() params: { id: string }
  ): Promise<IBlog | null> {
    const blog = await this.blogsRepository.getById(params.id)

    return blog
  }

  @Post(':blogId/posts')
  async creatPostByBlogId(
    @Param() params: { blogId: string },
    @Body() data: CreatePostDto
  ): Promise<any> {
    const blog = await this.blogsRepository.getById(params.blogId)

    if (!blog) {
      throw new HttpException({ message: "Blog doesn't exist" }, HttpStatus.FOUND)
    }

    const creatingData = {
      ...data,
      blogId: blog.id,
      blogName: blog.name
    }
  
    return this.postsRepository.createPost(creatingData)
  }
}
