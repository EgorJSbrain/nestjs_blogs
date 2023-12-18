import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { CommentsRepository } from './comments.repository';
import { CommentsController } from './comments.controller';
import { Comment, CommentSchema } from './comments.schema';
import { LikesRepository } from '../likes/likes.repository';
import { Like, LikeSchema } from '../likes/likes.schema';
import { JwtRepository } from '../jwt/jwt.repository';
import { UsersRepository } from '../users/users.repository';
import { User, UserSchema } from '../users/users.schema';
import { HashRepository } from '../hash/hash.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: User.name, schema: UserSchema },
    ])],
  controllers: [CommentsController],
  providers: [
    JwtService,
    LikesRepository,
    CommentsRepository,
    JwtRepository,
    UsersRepository,
    HashRepository,
  ]
})

export class CommentsModule {}
