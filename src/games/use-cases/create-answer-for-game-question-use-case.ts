import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { QuestionEntity } from '../../entities/question';
import { AnswerEntity } from 'src/entities/answer';
import { AnswerStatusEnum } from 'src/constants/answer';

@Injectable()
export class CreateAnswerForGameQuestionUseCase {
  constructor(
    @InjectRepository(AnswerEntity)
    private readonly answersRepo: Repository<AnswerEntity>,
  ) {}

  async execute ( questionId: string, status: AnswerStatusEnum) {
    return await this.answersRepo
        .createQueryBuilder()
        .insert()
        .values({
          answerStatus: status,
          questionId,
        })
        .execute()
  }
}
