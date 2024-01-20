import { Module } from '@nestjs/common';

import { BasicAuthStrategy } from '../auth/strategies/basic.strategy';
import { HashService } from '../hash/hash.service';
import { UsersRepository } from './users.repository';
import { UsersSAController } from './users.controller.sa';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user';

const adapters = [BasicAuthStrategy]
const repositories = [UsersRepository, HashService]
const useCases = []

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersSAController],
  providers: [UsersService, ...repositories, ...adapters, ...useCases]
})

export class UsersModule {}
