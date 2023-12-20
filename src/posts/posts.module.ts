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
import { Like, LikeSchema } from '../likes/likes.schema';
import { JWTService } from '../jwt/jwt.service';
import { BlogIdValidator } from '../validators/blog-id.validator';
import { CommentsRepository } from '../comments/comments.repository';
import { Comment, CommentSchema } from '../comments/comments.schema';
import { HashService } from '../hash/hash.service';

@Module({
  imports: [
    MongooseModule.forFeature([
    { name: Like.name, schema: LikeSchema },
    { name: Post.name, schema: PostSchema },
    { name: Blog.name, schema: BlogSchema },
    { name: User.name, schema: UserSchema },
    { name: Comment.name, schema: CommentSchema },
  ]),
],
  controllers: [PostsController],
  providers: [
    JWTService,
    LikesRepository,
    PostsRepository,
    JwtService,
    BlogsRepository,
    UsersRepository,
    BlogIdValidator,
    CommentsRepository,
    HashService,
  ]
})

export class PostsModule {}
