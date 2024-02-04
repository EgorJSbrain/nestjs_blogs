import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LikesRepository } from './likes.repository';
import { CommentLikeEntity } from '../entities/comment-like';

@Module({
  imports: [TypeOrmModule.forFeature([CommentLikeEntity])],
  providers: [LikesRepository]
})

export class LikesModule {}
