import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GenerealController } from './general.controller';
import { Post, PostSchema } from '../posts/posts.schema';
import { Comment, CommentSchema } from '../comments/comments.schema';
import { GeneralSqlRepository } from './general.sql.repository';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Post.name, schema: PostSchema },
    { name: Comment.name, schema: CommentSchema },
  ])],
  controllers: [GenerealController],
  providers: [GeneralSqlRepository]
})

export class GeneralModule {}
