import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { PostsRepository } from './posts.repository';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './posts.schema';
import { LikesRepository } from '../likes/likes.repository';
import { Like, LikeSchema } from '../likes/likes.schema';
import { JWTService } from '../jwt/jwt.service';
import { BlogIdValidator } from '../validators/blog-id.validator';
import { CommentsRepository } from '../comments/comments.repository';
import { Comment, CommentSchema } from '../comments/comments.schema';
import { HashService } from '../hash/hash.service';
import { PostsSqlRepository } from './posts.repository.sql';
import { LikesSqlRepository } from '../likes/likes.repository.sql';
import { UsersSQLRepository } from '../users/users.repository.sql';
import { CommentsSqlRepository } from '../comments/comments.repository.sql';
import { BlogsSqlRepository } from '../blogs/blogs.repository.sql';

@Module({
  imports: [
    MongooseModule.forFeature([
    { name: Like.name, schema: LikeSchema },
    { name: Post.name, schema: PostSchema },
    { name: Comment.name, schema: CommentSchema },
  ]),
],
  controllers: [PostsController],
  providers: [
    JWTService,
    LikesRepository,
    LikesSqlRepository,
    PostsRepository,
    PostsSqlRepository,
    JwtService,
    UsersSQLRepository,
    BlogIdValidator,
    BlogsSqlRepository,
    CommentsRepository,
    CommentsSqlRepository,
    HashService,
  ]
})

export class PostsModule {}
