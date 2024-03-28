import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentsController } from './comments.controller';
import { JWTService } from '../jwt/jwt.service';
import { HashService } from '../hash/hash.service';
import { LikesRepository } from '../likes/likes.repository';
import { CommentsRepository } from './comments.repository';
import { UsersRepository } from '../users/users.repository';
import { UserEntity } from '../entities/user';
import { CommentEntity } from '../entities/comment';
import { CommentLikeEntity } from '../entities/comment-like';
import { PostLikeEntity } from '../entities/post-like';
import { BanUsersBlogsEntity } from '../entities/ban-users-blogs';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CommentEntity,
      CommentLikeEntity,
      PostLikeEntity,
      BanUsersBlogsEntity
    ])
  ],
  controllers: [CommentsController],
  providers: [
    JWTService,
    LikesRepository,
    CommentsRepository,
    JwtService,
    UsersRepository,
    HashService
  ]
})
export class CommentsModule {}
