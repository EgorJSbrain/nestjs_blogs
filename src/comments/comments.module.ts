import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentsController } from './comments.controller';
import { JWTService } from '../jwt/jwt.service';
import { HashService } from '../hash/hash.service';
import { LikesSqlRepository } from '../likes/likes.repository.sql';
import { CommentsSqlRepository } from './comments.repository.sql';
import { UsersRepository } from '../users/users.repository';
import { UserEntity } from '../entities/user';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [CommentsController],
  providers: [
    JWTService,
    LikesSqlRepository,
    CommentsSqlRepository,
    JwtService,
    UsersRepository,
    HashService,
  ]
})

export class CommentsModule {}
