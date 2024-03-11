import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ResponseBody } from '../types/request';
import { SortDirections, SortType } from '../constants/global';
import { appMessages } from '../constants/messages';
import { QuestionEntity } from '../entities/question';
import { IQuestion, IQuestionData, QuestionsRequestParams } from '../types/questions';
import { CreateQuestionDto } from '../dtos/questions/create-question.dto';
import { QuestionPublishDto } from '../dtos/questions/question.dto';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionsRepo: Repository<QuestionEntity>
  ) {}

  async getAll(
    params: QuestionsRequestParams,
  ): Promise<ResponseBody<IQuestion> | []> {
    try {const {
      sortBy = 'createdAt',
      sortDirection = SortDirections.desc,
      pageNumber = 1,
      pageSize = 10,
      bodySearchTerm = ''
    } = params

    let whereFilter = ''
      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber

      const query = this.questionsRepo.createQueryBuilder('question')

      if (bodySearchTerm) {
        whereFilter = 'question.body ILIKE :body'
      }

      const searchObject = query
        .where(whereFilter, {
          name: bodySearchTerm ? `%${bodySearchTerm}%` : undefined
        })
        .select([
          'question.id',
          'question.body',
          'question.correctAnswers',
          'question.createdAt',
          'question.updatedAt',
          'question.published'
        ])
        .addOrderBy(
          `question.${sortBy}`,
          sortDirection?.toLocaleUpperCase() as SortType
        )
        .skip(skip)
        .take(pageSizeNumber)

      const questions = await searchObject.getMany()
      const count = await searchObject.getCount()
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const updatedQuestions = questions.map(question => ({
        ...question,
        correctAnswers: JSON.parse(question.correctAnswers)
      }))

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: updatedQuestions
      }
    } catch(e) {
      return []
    }
  }

  async getById(id: string): Promise<IQuestion | null> {
    const query = this.questionsRepo.createQueryBuilder('question')

    const question = await query
      .select([
        'question.id',
        'question.body',
        'question.correctAnswers',
        'question.published',
        'question.createdAt',
        'question.updatedAt',
      ])
      .where('question.id = :id', { id })
      .getOne()

    if (!question) {
      return null
    }

    return {
      ...question,
      correctAnswers: JSON.parse(question.correctAnswers)
    }
  }

  async createQuestion(data: CreateQuestionDto): Promise<IQuestion | null> {
    try {
      const query = this.questionsRepo.createQueryBuilder('question')

      const newQuestion = await query
        .insert()
        .values({
          body: data.body,
          correctAnswers: JSON.stringify(data.correctAnswers),
        })
        .execute()

      const question = await this.getById(newQuestion.raw[0].id)

      if (!question) {
        return null
      }

      return question
    } catch(e) {
      throw new Error(appMessages().errors.somethingIsWrong)
    }
  }

  async togglePublishingQuestion(data: QuestionPublishDto): Promise<IQuestion | null> {
    try {
      const query = this.questionsRepo.createQueryBuilder('question')

      const updatedQuestion = await query
        .insert()
        .values({
          published: data.published,
        })
        .execute()

      const question = await this.getById(updatedQuestion.raw[0].id)

      if (!question) {
        return null
      }

      return question
    } catch(e) {
      throw new Error(appMessages().errors.somethingIsWrong)
    }
  }

  async updateQuestion(id: string, data: IQuestionData): Promise<boolean> {
    const updatedQuestion = await this.questionsRepo
      .createQueryBuilder('post')
      .update()
      .set({
        body: data.body,
        correctAnswers: data.correctAnswers,
        published: data.published ?? false,
      })
      .where('id = :id', {
        id
      })
      .execute()

    if (!updatedQuestion.affected) {
      return false
    }

    return true
  }

  async deleteQuestion(id: string) {
    try {
      const question = await this.questionsRepo
        .createQueryBuilder('question')
        .softDelete()
        .where('id = :id', { id })
        .execute()

      return !!question.affected
    } catch (e) {
      throw new Error(appMessages().errors.somethingIsWrong)
    }
  }
}
