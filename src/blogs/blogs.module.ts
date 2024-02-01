import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogsController } from './blogs.controller';
import { LikesModule } from '../likes/likes.module';
import { JWTService } from '../jwt/jwt.service';
import { BlogsSAController } from './blogs.controller.sa';
import { BlogsRepository } from './blogs.repository';
import { PostsRepository } from '../posts/posts.repository';
import { LikesRepository } from '../likes/likes.repository';
import { BlogEntity } from '../entities/blog';
import { PostEntity } from '../entities/post';
import { CommentLikeEntity } from '../entities/comment-like';
import { PostLikeEntity } from '../entities/post-like';

@Module({
  imports: [
  TypeOrmModule.forFeature([BlogEntity, PostEntity, CommentLikeEntity, PostLikeEntity]),
  LikesModule,
],
  controllers: [BlogsController, BlogsSAController],
  providers: [
    JwtService,
    PostsRepository,
    JWTService,
    BlogsRepository,
    LikesRepository,
  ]
})

export class BlogsModule {}
