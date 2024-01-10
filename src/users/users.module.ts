import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './users.schema';
import { BasicAuthStrategy } from '../auth/strategies/basic.strategy';
import { HashService } from '../hash/hash.service';
import { UsersSQLRepository } from './users.repository.sql';
import { UsersSAController } from './users.controller.sa';

const adapters = [BasicAuthStrategy]
const repositories = [HashService, UsersSQLRepository]
const useCases = []

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersSAController],
  providers: [...repositories, ...adapters, ...useCases]
})

export class UsersModule {}
