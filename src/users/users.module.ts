import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { User, UserSchema } from './users.schema';
import { BasicAuthStrategy } from '../auth/strategies/basic.strategy';
import { HashService } from '../hash/hash.service';
import { UsersSQLRepository } from './users.sql.repository';

const adapters = [BasicAuthStrategy]
const repositories = [UsersRepository, HashService, UsersSQLRepository]
const useCases = []

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [...repositories, ...adapters, ...useCases]
})

export class UsersModule {}
