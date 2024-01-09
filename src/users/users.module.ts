import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './users.schema';
import { BasicAuthStrategy } from '../auth/strategies/basic.strategy';
import { HashService } from '../hash/hash.service';
import { UsersSQLRepository } from './users.sql.repository';
import { UsersSqlController } from './users.controller.sa';

const adapters = [BasicAuthStrategy]
const repositories = [HashService, UsersSQLRepository]
const useCases = []

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersSqlController],
  providers: [...repositories, ...adapters, ...useCases]
})

export class UsersModule {}
