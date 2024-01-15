import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { BlogsController } from './blogs.controller';
import { PostsRepository } from '../posts/posts.repository';
import { Post, PostSchema } from '../posts/posts.schema';
import { LikesRepository } from '../likes/likes.repository';
import { LikesModule } from '../likes/likes.module';
import { Like, LikeSchema } from '../likes/likes.schema';
import { JWTService } from '../jwt/jwt.service';
import { BlogsSAController } from './blogs.controller.sa';
import { BlogsSqlRepository } from './blogs.repository.sql';
import { PostsSqlRepository } from '../posts/posts.repository.sql';
import { LikesSqlRepository } from '../likes/likes.repository.sql';

@Module({
  imports: [
  MongooseModule.forFeature([
    { name: Post.name, schema: PostSchema },
    { name: Like.name, schema: LikeSchema },
  ]),
  LikesModule,
],
  controllers: [BlogsController, BlogsSAController],
  providers: [
    JwtService,
    LikesRepository,
    PostsRepository,
    PostsSqlRepository,
    JWTService,
    BlogsSqlRepository,
    LikesSqlRepository,
  ]
})

export class BlogsModule {}
