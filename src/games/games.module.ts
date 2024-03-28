import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameEntity } from '../entities/game';
import { ProgressEntity } from '../entities/progress';
import { GameQuestionEntity } from '../entities/game-question';
import { UserEntity } from '../entities/user';
import { QuestionEntity } from '../entities/question';
import { AnswerEntity } from '../entities/answer';
import { GamesController } from './games.controller';
import { UsersRepository } from '../users/users.repository';
import { ProgressesRepository } from '../progresses/progresses.repository';
import { GamesRepository } from './games.repository';
import { HashService } from '../hash/hash.service';
import { JWTService } from '../jwt/jwt.service';
import { CheckPalyerInGameUseCase } from './use-cases/check-player-in-game-use-case';
import { GetRandomQuestionsForGameUseCase } from './use-cases/get-random-questions-for-game-use-case';
import { SetRandomQuestionsForGameUseCase } from './use-cases/set-random-questions-for-game-use-case';
import { GamesService } from './games.service';
import { ProgressService } from '../progresses/progress.service';
import { BanUsersBlogsEntity } from '../entities/ban-users-blogs';

const useCases = [
  CheckPalyerInGameUseCase,
  GetRandomQuestionsForGameUseCase,
  SetRandomQuestionsForGameUseCase,
]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AnswerEntity,
      QuestionEntity,
      GameEntity,
      ProgressEntity,
      GameQuestionEntity,
      BanUsersBlogsEntity
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
    GamesService,
    ProgressService,
    ...useCases
  ]
})
export class GamesModule {}
