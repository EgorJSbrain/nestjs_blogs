import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'

import configuration from '../config/configuration'

import { UsersModule } from './users/users.module'
import { BlogsModule } from './blogs/blogs.module'
import { PostsModule } from './posts/posts.module'
import { CommentsModule } from './comments/comments.module'
import { GeneralModule } from './general/general.module'
import { AuthModule } from './auth/auth.module'
import { EmailAdapterModule } from './email-adapter/email-adapter.module'
import { EmailsModule } from './emails/emails.module'
import { EmailManagerModule } from './email-manager/email-manager.module'
import { JWTModule } from './jwt/jwt.module'
import { LikesModule } from './likes/likes.module'
import { HashModule } from './hash/hash.module'
import { DeviceModule } from './devices/devices.module'
import { BloggerBlogsModule } from './blogger-blogs/blogger-blogs.module'
import { CronModule } from './cron/cron.module'

import { UserEntity } from './entities/user'
import { BlogEntity } from './entities/blog'
import { PostEntity } from './entities/post'
import { DeviceEntity } from './entities/devices'
import { CommentLikeEntity } from './entities/comment-like'
import { CommentEntity } from './entities/comment'
import { PostLikeEntity } from './entities/post-like'
import { QuestionEntity } from './entities/question'
import { QuestionsModule } from './questions/questions.module'
import { ProgressEntity } from './entities/progress'
import { AnswerEntity } from './entities/answer'
import { GamesModule } from './games/games.module'
import { ProgressesModule } from './progresses/progresses.module'
import { GameQuestionEntity } from './entities/game-question'
import { GameEntity } from './entities/game'
import { BanUsersBlogsEntity } from './entities/ban-users-blogs'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB.HOST'),
        port: config.get('DB.PORT'),
        username: config.get('DB.USER'),
        password: config.get('DB.PASS'),
        database: config.get('DB.NAME'),
        entities: [
          UserEntity,
          BlogEntity,
          PostEntity,
          DeviceEntity,
          CommentEntity,
          CommentLikeEntity,
          PostLikeEntity,
          QuestionEntity,
          ProgressEntity,
          AnswerEntity,
          GameEntity,
          GameQuestionEntity,
          BanUsersBlogsEntity,
        ],
        autoLoadEntities: true,
        synchronize: false
      })
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration]
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get('THROTTLE_TTL')),
          limit: Number(config.get('THROTTLE_LIMIT'))
        }
      ]
    }),
    UsersModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    GeneralModule,
    AuthModule,
    EmailAdapterModule,
    EmailsModule,
    EmailManagerModule,
    JWTModule,
    LikesModule,
    HashModule,
    DeviceModule,
    QuestionsModule,
    GamesModule,
    ProgressesModule,
    CronModule,
    BloggerBlogsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
