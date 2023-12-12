import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { PostsRepository } from './posts.repository';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './posts.schema';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Blog, BlogSchema } from '../blogs/blogs.schema';
import { UsersRepository } from '../users/users.repository';
import { User, UserSchema } from '../users/users.schema';
import { LikesRepository } from '../likes/likes.repository';
import { LikesModule } from '../likes/likes.module';
import { Like, LikeSchema } from '../likes/likes.schema';
import { JWTModule } from '../jwt/jwt.module';
import { JwtRepository } from '../jwt/jwt.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
    { name: Like.name, schema: LikeSchema },
    { name: Post.name, schema: PostSchema },
    { name: Blog.name, schema: BlogSchema },
    { name: User.name, schema: UserSchema },
  ]),
],
  controllers: [PostsController],
  providers: [
    JwtService,
    LikesRepository,
    PostsRepository,
    JwtRepository,
    BlogsRepository,
    UsersRepository,
  ]
})

export class PostsModule {}
