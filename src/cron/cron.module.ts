import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CronService } from './cron.service';
import { GamesService } from 'src/games/games.service';
import { GameEntity } from 'src/entities/game';
import { GamesModule } from 'src/games/games.module';
import { GamesRepository } from 'src/games/games.repository';
import { ProgressesRepository } from 'src/progresses/progresses.repository';
import { GameQuestionEntity } from 'src/entities/game-question';
import { AnswerEntity } from 'src/entities/answer';
import { GetRandomQuestionsForGameUseCase } from 'src/games/use-cases/get-random-questions-for-game-use-case';
import { SetRandomQuestionsForGameUseCase } from 'src/games/use-cases/set-random-questions-for-game-use-case';
import { ProgressEntity } from 'src/entities/progress';
import { QuestionEntity } from 'src/entities/question';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // DailyReminderView,
      // ExclusiveUsersEntity,
      // TaskAttemptEntity,
      GameEntity,
      GameQuestionEntity,
      AnswerEntity,
      ProgressEntity,
      QuestionEntity
    ]),
    ScheduleModule.forRoot(),
    GamesModule,
    // NotificationsModule,
    // TasksModule,
    // TrophiesModule,
    // UsersModule,
    // ChildrenModule,
    // StreaksModule,
    // TransactionModule,
  ],
  providers: [
    CronService,
    GamesService,
    GamesRepository,
    ProgressesRepository,
    GetRandomQuestionsForGameUseCase,
    SetRandomQuestionsForGameUseCase
  ],
  exports: [CronService]
})
export class CronModule {}
