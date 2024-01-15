import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CommentsController } from './comments.controller';
import { JWTService } from '../jwt/jwt.service';
import { HashService } from '../hash/hash.service';
import { LikesSqlRepository } from '../likes/likes.repository.sql';
import { CommentsSqlRepository } from './comments.repository.sql';
import { UsersSQLRepository } from '../users/users.repository.sql';

@Module({
  controllers: [CommentsController],
  providers: [
    JWTService,
    LikesSqlRepository,
    CommentsSqlRepository,
    JwtService,
    UsersSQLRepository,
    HashService,
  ]
})

export class CommentsModule {}
