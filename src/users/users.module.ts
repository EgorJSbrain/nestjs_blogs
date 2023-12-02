import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { User, UserSchema } from './users.schema';
import { BasicAuthStrategy } from '../auth/strategies/basic.strategy';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersRepository, BasicAuthStrategy]
})

export class UsersModule {}
