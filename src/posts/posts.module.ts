import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostsController } from './posts.controller';
import { JWTService } from '../jwt/jwt.service';
import { BlogIdValidator } from '../validators/blog-id.validator';
import { HashService } from '../hash/hash.service';
import { PostsRepository } from './posts.repository';
import { LikesSqlRepository } from '../likes/likes.repository.sql';
import { UsersRepository } from '../users/users.repository';
import { CommentsSqlRepository } from '../comments/comments.repository.sql';
import { BlogsRepository } from '../blogs/blogs.repository';
import { UserEntity } from '../entities/user';
import { BlogEntity } from '../entities/blog';
import { PostEntity } from '../entities/post';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, BlogEntity, PostEntity])],
  controllers: [PostsController],
  providers: [
    JWTService,
    LikesSqlRepository,
    PostsRepository,
    JwtService,
    UsersRepository,
    BlogIdValidator,
    BlogsRepository,
    CommentsSqlRepository,
    HashService,
  ]
})

export class PostsModule {}
