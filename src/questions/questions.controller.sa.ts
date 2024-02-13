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

import { ResponseBody, RequestParams } from '../types/request'
import { appMessages } from '../constants/messages'
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard'
import { RoutesEnum } from '../constants/global'
import { QuestionsRepository } from './questions.repository'
import { IQuestion } from '../types/questions'
import { CreateQuestionDto } from '../dtos/questions/create-question.dto'
import { UpdateQuestionDto } from '../dtos/questions/update-question.dto'
import { QuestionPublishDto } from '../dtos/questions/question.dto'

@SkipThrottle()
@Controller(RoutesEnum.saQuizQuestions)
export class QuestionsSAController {
  constructor(
    private questionsRepository: QuestionsRepository,
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
  async updateQuestion(
    @Param() params: { id: string },
    @Body() data: UpdateQuestionDto
  ): Promise<undefined> {
    if (!params.id) {
      throw new HttpException(
        { message: appMessages(appMessages().questionId).errors.isRequiredField },
        HttpStatus.NOT_FOUND
      )
    }

    const existedQuestion = await this.questionsRepository.getById(params.id)

    if (!existedQuestion) {
      throw new HttpException(
        { message: appMessages(appMessages().question).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    const updatedQuestion = await this.questionsRepository.updateQuestion(params.id, {
      body: data.body,
      correctAnswers: JSON.stringify(data.correctAnswers),
      published: existedQuestion.published
    })

    if (!updatedQuestion) {
      throw new HttpException(
        { message: appMessages(appMessages().question).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Put('/:questionId/publish')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async publishQuestion(
    @Param() params: { questionId: string },
    @Body() data: QuestionPublishDto
  ): Promise<undefined> {
    const existedQuestion = await this.questionsRepository.getById(params.questionId)

    if (!existedQuestion) {
      throw new HttpException(
        { message: appMessages(appMessages().post).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    if (existedQuestion.published === data.published) {
      return
    }

    await this.questionsRepository.updateQuestion(existedQuestion.id, {
      body: existedQuestion.body,
      correctAnswers: JSON.stringify(existedQuestion.correctAnswers),
      published: data.published
    })

    return
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param() params: { id: string }): Promise<any> {
    const question = await this.questionsRepository.getById(params.id)

    if (!question) {
      throw new HttpException(
        { message: appMessages(appMessages().question).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    await this.questionsRepository.deleteQuestion(params.id)
  }
}
