import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
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
  ParseFilePipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { Request } from 'express'

import { BlogsRequestParams } from '../types/blogs'
import { RequestParams, ResponseBody } from '../types/request'
import { IBlog } from '../types/blogs'
import { appMessages } from '../constants/messages'
import { IExtendedPost } from '../types/posts'
import { JWTService } from '../jwt/jwt.service'
import { UsersService } from '../users/users.service'
import { RoutesEnum } from '../constants/global'
import { PostsRepository } from '../posts/posts.repository'
import { BlogsRepository } from '../blogs/blogs.repository'
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateBlogDto } from '../dtos/blogs/create-blog.dto'
import { CurrentUserId } from '../auth/current-user-id.param.decorator'
import { UsersRepository } from '../users/users.repository'
import { CreatePostDto } from '../dtos/posts/create-post.dto'
import { UpdatePostDto } from '../dtos/posts/update-post.dto'
import { BanUserBlogDto } from '../dtos/users/ban-user-blog.dto'
import { BloggerUsersRequestParams } from '../types/users'
import { CommentsRepository } from '../comments/comments.repository'
import { IExtendedComment } from '../types/comments'
import { UpdateBlogDto } from '../dtos/blogs/update-blog.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadWallpaperUseCase } from './use-cases/upload-wallpaper.use-case'
import { PipesConsumer } from '@nestjs/core/pipes'
import { FileValidationPipe } from './pipes/file-validation.pipe'

@SkipThrottle()
@Controller(RoutesEnum.blogger)
export class BlogsController {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
    private usersService: UsersService,
    private JWTService: JWTService,
    private uploadWallpaperUseCase: UploadWallpaperUseCase,
  ) {}

  @Get('/blogs')
  @UseGuards(JWTAuthGuard)
  async getAll(
    @Query() query: BlogsRequestParams,
    @CurrentUserId() userId: string
  ): Promise<ResponseBody<IBlog> | []> {
    return await this.blogsRepository.getAll(query, userId)
  }

  @Get('/blogs/comments')
  @UseGuards(JWTAuthGuard)
  async getAllComments(
    @Query() query: BlogsRequestParams,
    @CurrentUserId() userId: string
  ): Promise<ResponseBody<IExtendedComment> | []> {
    return await this.commentsRepository.getCommentsForAllPosts(query, userId)
  }

  @Put('/blogs/:blogId')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param() params: { blogId: string },
    @Body() data: UpdateBlogDto,
    @CurrentUserId() currenUserId: string
  ) {
    const { blogId } = params

    if (!blogId) {
      throw new HttpException(
        { message: appMessages(appMessages().blogId).errors.isRequiredField },
        HttpStatus.NOT_FOUND
      )
    }

    const blog = await this.blogsRepository.getById(blogId)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(
      blogId,
      currenUserId
    )

    if (!blogOfUser) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.FORBIDDEN
      )
    }

    const updatedBlog = await this.blogsRepository.updateBlog(
      blogId,
      data,
    )

    if (!updatedBlog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Get('/blogs/:id')
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

  @Post('/blogs')
  @UseGuards(JWTAuthGuard)
  async creatBlog(
    @Body() data: CreateBlogDto,
    @CurrentUserId() userId: string
  ): Promise<IBlog | null> {
    return this.blogsRepository.createBlog(data, userId)
  }

  @Get('/blogs/:blogId/posts')
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

    const posts = await this.postsRepository.getAll(
      query,
      currentUserId,
      blog.id
    )

    return posts
  }

  @Delete('/blogs/:id')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param() params: { id: string },
    @CurrentUserId() userId: string
  ) {
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

    const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(
      params.id,
      userId
    )

    if (!blogOfUser) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.FORBIDDEN
      )
    }

    await this.blogsRepository.deleteBlogByOwner(params.id, userId)
  }

  @Post('/blogs/:blogId/posts')
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

    const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(
      params.blogId,
      userId
    )

    if (!blogOfUser) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.FORBIDDEN
      )
    }

    const newPost = await this.postsRepository.createPost({
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

  @Put('/blogs/:blogId/posts/:postId')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() params: { blogId: string; postId: string },
    @Body() data: UpdatePostDto,
    @CurrentUserId() userId: string
  ) {
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

    const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(
      params.blogId,
      userId
    )

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

    const updatedPost = await this.postsRepository.updatePost(
      params.postId,
      data
    )

    if (!updatedPost) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Delete('/blogs/:blogId/posts/:postId')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param() params: { blogId: string; postId: string },
    @CurrentUserId() userId: string
  ) {
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

    const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(
      params.blogId,
      userId
    )

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

  @Put('/users/:userId/ban')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUnbanUserForBlog(
    @Param() params: { userId: string },
    @Body() data: BanUserBlogDto,
    @CurrentUserId() currenUserId: string
  ) {
    const queryRunner = this.dataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()
      const manager = queryRunner.manager

      const { userId } = params
      if (!userId) {
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

      const blog = await this.blogsRepository.getById(data.blogId)

      if (!blog) {
        throw new HttpException(
          { message: appMessages(appMessages().blog).errors.notFound },
          HttpStatus.NOT_FOUND
        )
      }

      const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(
        data.blogId,
        currenUserId
      )

      if (!blogOfUser) {
        throw new HttpException(
          { message: appMessages(appMessages().blog).errors.notFound },
          HttpStatus.FORBIDDEN
        )
      }

      const userBanned = await this.usersService.checkBanOfUserForBlog(
        userId,
        data.blogId
      )

      if (!userBanned && !data.isBanned) {
        return null
      }

      if (userBanned && userBanned.isBanned === data.isBanned) {
        return null
      }

      if (userBanned) {
        return await this.usersService.updateBanUserForBlog(
          userId,
          data.blogId,
          {
            banReason: data.banReason,
            isBanned: data.isBanned
          },
          manager
        )
      }

      await this.usersService.createBanUserForBlog(
        userId,
        data.blogId,
        {
          banReason: data.banReason,
          isBanned: data.isBanned
        },
        manager
      )

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

  @Get('/users/blog/:blogId')
  @UseGuards(JWTAuthGuard)
  async getBannedUserForBlog(
    @Query() query: BloggerUsersRequestParams,
    @Param() params: { blogId: string },
    @CurrentUserId() currenUserId: string
  ) {
    const { blogId } = params

    if (!blogId) {
      throw new HttpException(
        { message: appMessages(appMessages().blogId).errors.isRequiredField },
        HttpStatus.NOT_FOUND
      )
    }

    const user = await this.usersRepository.getById(currenUserId)

    if (!user) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const blog = await this.blogsRepository.getById(blogId)

    if (!blog) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const blogOfUser = await this.blogsRepository.getByIdAndOwnerId(
      blogId,
      currenUserId
    )

    if (!blogOfUser) {
      throw new HttpException(
        { message: appMessages(appMessages().blog).errors.notFound },
        HttpStatus.FORBIDDEN
      )
    }

    return await this.usersRepository.getBannedUsersForBlog(
      blogId,
      query
    )
  }

  @Post('/blogs/:blogId/images/wallpaper')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(FileInterceptor('file'))
  async uploadWallper(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Param() params: { blogId: string },
    @CurrentUserId() currenUserId: string
  ) {
    const { blogId } = params

    if (!blogId) {
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

    this.uploadWallpaperUseCase.execute(currenUserId, file.originalname, file.buffer)
  }
}
