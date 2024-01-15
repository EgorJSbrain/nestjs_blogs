import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { CommentsRepository } from './comments.repository';
import { CommentsController } from './comments.controller';
import { Comment, CommentSchema } from './comments.schema';
import { LikesRepository } from '../likes/likes.repository';
import { Like, LikeSchema } from '../likes/likes.schema';
import { JWTService } from '../jwt/jwt.service';
import { HashService } from '../hash/hash.service';
import { LikesSqlRepository } from '../likes/likes.repository.sql';
import { CommentsSqlRepository } from './comments.repository.sql';
import { UsersSQLRepository } from 'src/users/users.repository.sql';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ])],
  controllers: [CommentsController],
  providers: [
    JWTService,
    LikesRepository,
    LikesSqlRepository,
    CommentsRepository,
    CommentsSqlRepository,
    JwtService,
    UsersSQLRepository,
    HashService,
  ]
})

export class CommentsModule {}
