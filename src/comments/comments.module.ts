import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CommentsController } from './comments.controller';
import { JWTService } from '../jwt/jwt.service';
import { HashService } from '../hash/hash.service';
import { LikesSqlRepository } from '../likes/likes.repository.sql';
import { CommentsSqlRepository } from './comments.repository.sql';
import { UsersRepository } from '../users/users.repository';

@Module({
  controllers: [CommentsController],
  providers: [
    JWTService,
    LikesSqlRepository,
    CommentsSqlRepository,
    JwtService,
    UsersRepository,
    HashService,
  ]
})

export class CommentsModule {}
