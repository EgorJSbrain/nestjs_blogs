import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersRepository } from '../users/users.repository';
import { UserEntity } from '../entities/user';
import { ProgressesRepository } from './progresses.repository';
import { HashService } from '../hash/hash.service';
import { JWTService } from '../jwt/jwt.service';
import { ProgressEntity } from '../entities/progress';
import { ProgressService } from './progress.service';
import { BanUsersBlogsEntity } from '../entities/ban-users-blogs';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ProgressEntity,
      BanUsersBlogsEntity
    ])
  ],
  providers: [
    UsersRepository,
    JwtService,
    JWTService,
    ProgressesRepository,
    HashService,
    ProgressService,
  ]
})
export class ProgressesModule {}
