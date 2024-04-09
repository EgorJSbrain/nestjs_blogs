import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogEntity } from '../entities/blog';
import { PostLikeEntity } from '../entities/post-like';
import { PostEntity } from '../entities/post';
import { UserEntity } from '../entities/user';
import { CommentLikeEntity } from '../entities/comment-like';
import { LikesModule } from '../likes/likes.module';
import { BlogsController } from './blogs.controller';
import { JWTService } from '../jwt/jwt.service';
import { BlogsSAController } from './blogs.controller.sa';
import { BlogsRepository } from './blogs.repository';
import { PostsRepository } from '../posts/posts.repository';
import { LikesRepository } from '../likes/likes.repository';
import { UsersRepository } from '../users/users.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { HashService } from '../hash/hash.service';
import { BanUsersBlogsEntity } from '../entities/ban-users-blogs';
import { CommentEntity } from '../entities/comment';
import { UsersBlogsEntity } from '../entities/users-blogs';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogEntity,
      PostEntity,
      CommentLikeEntity,
      PostLikeEntity,
      UserEntity,
      BanUsersBlogsEntity,
      CommentEntity,
      UsersBlogsEntity,
    ]),
    LikesModule
  ],
  controllers: [BlogsController, BlogsSAController],
  providers: [
    JwtService,
    PostsRepository,
    JWTService,
    BlogsRepository,
    LikesRepository,
    UsersRepository,
    CommentsRepository,
    HashService
  ]
})
export class BlogsModule {}
