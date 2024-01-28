import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogsController } from './blogs.controller';
import { LikesModule } from '../likes/likes.module';
import { JWTService } from '../jwt/jwt.service';
import { BlogsSAController } from './blogs.controller.sa';
import { BlogsRepository } from './blogs.repository';
import { PostsRepository } from '../posts/posts.repository';
import { LikesSqlRepository } from '../likes/likes.repository.sql';
import { BlogEntity } from '../entities/blog';
import { PostEntity } from '../entities/post';

@Module({
  imports: [
  TypeOrmModule.forFeature([BlogEntity, PostEntity]),
  LikesModule,
],
  controllers: [BlogsController, BlogsSAController],
  providers: [
    JwtService,
    PostsRepository,
    JWTService,
    BlogsRepository,
    LikesSqlRepository,
  ]
})

export class BlogsModule {}
