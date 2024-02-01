import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LikesRepository } from './likes.repository';
import { PostLikeEntity } from '../entities/post-like';
import { CommentLikeEntity } from '../entities/comment-like';

@Module({
  imports: [TypeOrmModule.forFeature([CommentLikeEntity, PostLikeEntity])],
  providers: [LikesRepository]
})

export class LikesModule {}
