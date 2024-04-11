import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostsController } from './posts.controller';
import { JWTService } from '../jwt/jwt.service';
import { BlogIdValidator } from '../validators/blog-id.validator';
import { HashService } from '../hash/hash.service';
import { PostsRepository } from './posts.repository';
import { LikesRepository } from '../likes/likes.repository';
import { UsersRepository } from '../users/users.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { BlogsRepository } from '../blogs/blogs.repository';
import { UserEntity } from '../entities/user';
import { BlogEntity } from '../entities/blog';
import { PostEntity } from '../entities/post';
import { CommentEntity } from '../entities/comment';
import { PostLikeEntity } from '../entities/post-like';
import { CommentLikeEntity } from '../entities/comment-like';
import { BanUsersBlogsEntity } from '../entities/ban-users-blogs';
import { UsersBlogsEntity } from '../entities/users-blogs';
import { TelegramAdapter } from 'src/adapters/telegram.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      BlogEntity,
      PostEntity,
      CommentEntity,
      PostLikeEntity,
      CommentLikeEntity,
      BanUsersBlogsEntity,
      UsersBlogsEntity,
    ])
  ],
  controllers: [PostsController],
  providers: [
    JWTService,
    LikesRepository,
    PostsRepository,
    JwtService,
    UsersRepository,
    BlogIdValidator,
    BlogsRepository,
    CommentsRepository,
    HashService,
    TelegramAdapter
  ]
})
export class PostsModule {}
