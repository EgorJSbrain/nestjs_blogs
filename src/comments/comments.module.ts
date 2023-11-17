import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommentsRepository } from './comments.repository';
import { CommentsController } from './comments.controller';
import { Comment, CommentSchema } from './comments.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }])],
  controllers: [CommentsController],
  providers: [CommentsRepository]
})

export class CommentsModule {}
