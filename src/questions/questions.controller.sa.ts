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
import { PostsRepository } from '../posts/posts.repository'
import { UsersRepository } from '../users/users.repository'
import { CommentsRepository } from '../comments/comments.repository'
import { QuestionsRepository } from './questions.repository'
import { IQuestion } from 'src/types/questions'
import { CreateQuestionDto } from 'src/dtos/questions/create-question.dto'

@SkipThrottle()
@Controller(RoutesEnum.saQuizQuestions)
export class QuestionsSAController {
  constructor(
    private questionsRepository: QuestionsRepository,
    // private usersRepository: UsersRepository,
    private JWTService: JWTService,
    // private CommentsRepository: CommentsRepository,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAll(
    @Query() query: RequestParams,
    @Req() req: Request,
  ): Promise<ResponseBody<IQuestion> | []> {
    const questions = await this.questionsRepository.getAll(query)

    return questions
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async creatQuestion(@Body() data: CreateQuestionDto): Promise<any> {
    return this.questionsRepository.createQuestion(data)
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

    const post = await this.questionsRepository.getById(params.id)

    if (!post) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const updatedPost = await this.questionsRepository.updateQuestion(params.id, data)

    if (!updatedPost) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Put('/:questionId/publish')
  @UseGuards(JWTAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async publishQuestion(
    @Param() params: { postId: string },
    @Body() data: LikeDto
  ): Promise<undefined> {
    const existedPost = await this.questionsRepository.getById(params.postId)

    if (!existedPost) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param() params: { id: string }): Promise<any> {
    const post = await this.questionsRepository.getById(params.id)

    if (!post) {
      throw new HttpException({ message: appMessages(appMessages().post).errors.notFound }, HttpStatus.NOT_FOUND)
    }

    await this.questionsRepository.deleteQuestion(params.id)
  }
}
