import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersRepository } from '../users/users.repository';
import { UserEntity } from '../entities/user';
import { ProgressesRepository } from './progresses.repository';
import { HashService } from '../hash/hash.service';
import { JWTService } from '../jwt/jwt.service';
import { ProgressEntity } from '../entities/progress';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ProgressEntity,
    ])
  ],
  providers: [
    UsersRepository,
    JwtService,
    JWTService,
    ProgressesRepository,
    HashService,
  ]
})
export class ProgressesModule {}
