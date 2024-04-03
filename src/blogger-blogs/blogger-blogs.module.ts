import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogEntity } from '../entities/blog';
import { PostLikeEntity } from '../entities/post-like';
import { PostEntity } from '../entities/post';
import { UserEntity } from '../entities/user';
import { CommentLikeEntity } from '../entities/comment-like';
import { LikesModule } from '../likes/likes.module';
import { BlogsController } from './blogger-blogs.controller';
import { JWTService } from '../jwt/jwt.service';
import { PostsRepository } from '../posts/posts.repository';
import { LikesRepository } from '../likes/likes.repository';
import { UsersRepository } from '../users/users.repository';
import { HashService } from '../hash/hash.service';
import { BlogsRepository } from '../blogs/blogs.repository';
import { UsersService } from '../users/users.service';
import { DevicesRepository } from '../devices/devices.repository';
import { DeviceEntity } from '../entities/devices';
import { BanUsersBlogsEntity } from '../entities/ban-users-blogs';
import { CommentsRepository } from '../comments/comments.repository';
import { CommentEntity } from '../entities/comment';
import { UploadWallpaperUseCase } from './use-cases/upload-wallpaper.use-case';
import { S3StorageAdapter } from './adapters/s3-storage-adapter.service';
import { FilesRepository } from '../files/files.repository';
import { FileEntity } from '../entities/files';

const useCases = [
  UploadWallpaperUseCase
]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogEntity,
      PostEntity,
      CommentLikeEntity,
      PostLikeEntity,
      UserEntity,
      DeviceEntity,
      BanUsersBlogsEntity,
      CommentEntity,
      FileEntity,
    ]),
    LikesModule
  ],
  controllers: [BlogsController],
  providers: [
    JwtService,
    PostsRepository,
    JWTService,
    BlogsRepository,
    LikesRepository,
    UsersRepository,
    HashService,
    UsersService,
    DevicesRepository,
    CommentsRepository,
    S3StorageAdapter,
    FilesRepository,
    ...useCases
  ]
})
export class BloggerBlogsModule {}
