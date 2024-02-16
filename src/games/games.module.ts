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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AnswerEntity,
      QuestionEntity,
      GameEntity,
      ProgressEntity,
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
  ]
})
export class GamesModule {}
