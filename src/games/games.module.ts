import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamesController } from './games.controller';
import { UsersRepository } from '../users/users.repository';
import { UserEntity } from '../entities/user';
import { GamesRepository } from './games.repository';
import { AnswerEntity } from '../entities/answer';
import { QuestionEntity } from '../entities/question';
import { HashService } from '../hash/hash.service';
import { JWTService } from '../jwt/jwt.service';
import { ProgressesRepository } from '../progresses/progresses.repository';
import { GameEntity } from '../entities/game';
import { ProgressEntity } from '../entities/progress';
import { CheckPalyerInGameUseCase } from './use-cases/check-player-in-game-use-case';
import { GameQuestionEntity } from '../entities/game-questions';
import { GetRandomQuestionsForGameUseCase } from './use-cases/get-random-questions-for-game-use-case';
import { SetRandomQuestionsForGameUseCase } from './use-cases/set-random-questions-for-game-use-case';

const useCases = [
  CheckPalyerInGameUseCase,
  GetRandomQuestionsForGameUseCase,
  SetRandomQuestionsForGameUseCase
]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AnswerEntity,
      QuestionEntity,
      GameEntity,
      ProgressEntity,
      GameQuestionEntity
    ])
  ],
  controllers: [GamesController],
  providers: [
    UsersRepository,
    JwtService,
    JWTService,
    GamesRepository,
    HashService,
    ProgressesRepository,
    ...useCases
  ]
})
export class GamesModule {}
