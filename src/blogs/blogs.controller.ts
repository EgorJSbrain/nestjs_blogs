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
import { BlogsRepository } from './blogs.repository'
import { Blog, BlogDocument } from './blogs.schema'
import { CreateBlogDto } from 'src/dtos/blogs/create-blog.dto'
import { BlogsRequestParams } from 'src/typing/blogs'
import { ResponseBody } from 'src/typing/request'

@Controller('blogs')
export class BlogsController {
  constructor(private blogsRepository: BlogsRepository) {}

  @Get()
  async getAll(
    @Query() query: BlogsRequestParams
  ): Promise<ResponseBody<BlogDocument> | []> {
    const blogs = await this.blogsRepository.getAll(query)

    return blogs
  }

  @Get(':id')
  async getBlogById(@Param() params: { id: string }): Promise<Blog | null> {
    const blog = await this.blogsRepository.getById(params.id)

    return blog
  }

  @Post()
  async creatBlog(@Body() data: CreateBlogDto): Promise<any> {
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

  @Get(':id/posts')
  async getPostsByBlogId(
    @Param() params: { id: string }
  ): Promise<Blog | null> {
    const blog = await this.blogsRepository.getById(params.id)

    return blog
  }

  @Post()
  async creatPostByBlogId(@Body() data: CreateBlogDto): Promise<any> {
    return this.blogsRepository.createBlog(data)
  }
}
