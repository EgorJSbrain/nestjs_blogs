import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BlogsController } from './blogs.controller';
import { LikesModule } from '../likes/likes.module';
import { JWTService } from '../jwt/jwt.service';
import { BlogsSAController } from './blogs.controller.sa';
import { BlogsSqlRepository } from './blogs.repository.sql';
import { PostsSqlRepository } from '../posts/posts.repository.sql';
import { LikesSqlRepository } from '../likes/likes.repository.sql';

@Module({
  imports: [
  LikesModule,
],
  controllers: [BlogsController, BlogsSAController],
  providers: [
    JwtService,
    PostsSqlRepository,
    JWTService,
    BlogsSqlRepository,
    LikesSqlRepository,
  ]
})

export class BlogsModule {}
