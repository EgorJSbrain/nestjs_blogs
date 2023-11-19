import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsRepository } from './blogs.repository';
import { BlogsController } from './blogs.controller';
import { Blog, BlogSchema } from './blogs.schema';
import { PostsRepository } from 'src/posts/posts.repository';
import { Post, PostSchema } from 'src/posts/posts.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Blog.name, schema: BlogSchema },
    { name: Post.name, schema: PostSchema },
  ])],
  controllers: [BlogsController],
  providers: [
    BlogsRepository,
    PostsRepository
  ]
})

export class BlogsModule {}
