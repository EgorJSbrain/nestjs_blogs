import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { User, UserSchema } from './users.schema';
import { BasicAuthStrategy } from '../auth/strategies/basic.strategy';
import { HashService } from '../hash/hash.service';
import { HashModule } from 'src/hash/hash.module';

const adapters = [BasicAuthStrategy]
const repositories = [UsersRepository, HashService]
const useCases = []

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // HashModule,
  ],
  controllers: [UsersController],
  providers: [...repositories, ...adapters, ...useCases]
})

export class UsersModule {}
