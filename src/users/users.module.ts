import { Module } from '@nestjs/common';

import { BasicAuthStrategy } from '../auth/strategies/basic.strategy';
import { HashService } from '../hash/hash.service';
import { UsersRepository } from './users.repository';
import { UsersSAController } from './users.controller.sa';

const adapters = [BasicAuthStrategy]
const repositories = [HashService, UsersRepository]
const useCases = []

@Module({
  controllers: [UsersSAController],
  providers: [...repositories, ...adapters, ...useCases]
})

export class UsersModule {}
