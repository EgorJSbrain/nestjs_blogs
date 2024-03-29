import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { QuestionEntity } from '../../entities/question';
import { GameQuestionEntity } from '../../entities/game-question';

@Injectable()
export class SetRandomQuestionsForGameUseCase {
  constructor(
    @InjectRepository(GameQuestionEntity)
    private readonly gameQuestionsRepo: Repository<GameQuestionEntity>,
  ) {}

  async execute (questions: QuestionEntity[], gameId: string) {
    questions.forEach(async(question, index) => {
      return await this.gameQuestionsRepo
        .createQueryBuilder()
        .insert()
        .values({
          gameId,
          questionId: question.id,
          order: index
        })
        .execute()
    })
  }
}
