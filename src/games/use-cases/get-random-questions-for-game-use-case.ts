import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { QuestionEntity } from '../../entities/question';

@Injectable()
export class GetRandomQuestionsForGameUseCase {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionsRepo: Repository<QuestionEntity>,
  ) {}

  async execute (): Promise<QuestionEntity[] | []> {
    return this.questionsRepo
      .createQueryBuilder()
      .orderBy('RANDOM()')
      .limit(5)
      .getMany()
  }
}
