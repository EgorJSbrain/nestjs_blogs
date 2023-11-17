import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostsRepository } from './posts.repository';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './posts.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }])],
  controllers: [PostsController],
  providers: [PostsRepository]
})

export class PostsModule {}
