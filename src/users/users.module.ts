import { Module } from '@nestjs/common';

import { BasicAuthStrategy } from '../auth/strategies/basic.strategy';
import { HashService } from '../hash/hash.service';
import { UsersRepository } from './users.repository';
import { UsersSAController } from './users.controller.sa';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user';
import { DevicesRepository } from '../devices/devices.repository';
import { DeviceEntity } from '../entities/devices';

const adapters = [BasicAuthStrategy]
const repositories = [UsersRepository, HashService, DevicesRepository]
const useCases = []

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, DeviceEntity])],
  controllers: [UsersSAController],
  providers: [UsersService, ...repositories, ...adapters, ...useCases]
})

export class UsersModule {}
