import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { BlogsRepository } from './blogs.repository';
import { BlogsController } from './blogs.controller';
import { Blog, BlogSchema } from './blogs.schema';
import { PostsRepository } from '../posts/posts.repository';
import { Post, PostSchema } from '../posts/posts.schema';
import { LikesRepository } from '../likes/likes.repository';
import { LikesModule } from '../likes/likes.module';
import { Like, LikeSchema } from '../likes/likes.schema';
import { JwtRepository } from '../jwt/jwt.repository';

@Module({
  imports: [
  MongooseModule.forFeature([
    { name: Blog.name, schema: BlogSchema },
    { name: Post.name, schema: PostSchema },
    { name: Like.name, schema: LikeSchema },
  ]),
  LikesModule,
],
  controllers: [BlogsController],
  providers: [
    JwtService,
    LikesRepository,
    BlogsRepository,
    PostsRepository,
    JwtRepository,
  ]
})

export class BlogsModule {}
