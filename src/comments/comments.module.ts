import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { CommentsRepository } from './comments.repository';
import { CommentsController } from './comments.controller';
import { Comment, CommentSchema } from './comments.schema';
import { LikesRepository } from '../likes/likes.repository';
import { Like, LikeSchema } from '../likes/likes.schema';
import { JWTService } from '../jwt/jwt.service';
import { UsersRepository } from '../users/users.repository';
import { User, UserSchema } from '../users/users.schema';
import { HashService } from '../hash/hash.service';
import { LikesSqlRepository } from '../likes/likes.repository.sql';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: User.name, schema: UserSchema },
    ])],
  controllers: [CommentsController],
  providers: [
    JWTService,
    LikesRepository,
    LikesSqlRepository,
    CommentsRepository,
    JwtService,
    UsersRepository,
    HashService,
  ]
})

export class CommentsModule {}
