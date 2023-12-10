import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostsRepository } from './posts.repository';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './posts.schema';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Blog, BlogSchema } from '../blogs/blogs.schema';
import { UsersRepository } from '../users/users.repository';
import { User, UserSchema } from 'src/users/users.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Post.name, schema: PostSchema },
    { name: Blog.name, schema: BlogSchema },
    { name: User.name, schema: UserSchema },
  ])],
  controllers: [PostsController],
  providers: [
    PostsRepository,
    BlogsRepository,
    UsersRepository
  ]
})

export class PostsModule {}
