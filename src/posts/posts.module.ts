import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PostsController } from './posts.controller';
import { JWTService } from '../jwt/jwt.service';
import { BlogIdValidator } from '../validators/blog-id.validator';
import { HashService } from '../hash/hash.service';
import { PostsSqlRepository } from './posts.repository.sql';
import { LikesSqlRepository } from '../likes/likes.repository.sql';
import { UsersSQLRepository } from '../users/users.repository.sql';
import { CommentsSqlRepository } from '../comments/comments.repository.sql';
import { BlogsSqlRepository } from '../blogs/blogs.repository.sql';

@Module({
  controllers: [PostsController],
  providers: [
    JWTService,
    LikesSqlRepository,
    PostsSqlRepository,
    JwtService,
    UsersSQLRepository,
    BlogIdValidator,
    BlogsSqlRepository,
    CommentsSqlRepository,
    HashService,
  ]
})

export class PostsModule {}
