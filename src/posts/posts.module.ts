import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostsRepository } from './posts.repository';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './posts.schema';
import { BlogsRepository } from 'src/blogs/blogs.repository';
import { Blog, BlogSchema } from 'src/blogs/blogs.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Post.name, schema: PostSchema },
    { name: Blog.name, schema: BlogSchema },
  ])],
  controllers: [PostsController],
  providers: [
    PostsRepository,
    BlogsRepository
  ]
})

export class PostsModule {}
