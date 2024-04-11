import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IntegrationService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { TelegramAdapter } from '../adapters/telegram.adapter';
import { UsersRepository } from '../users/users.repository';
import { UserEntity } from '../entities/user';
import { BanUsersBlogsEntity } from '../entities/ban-users-blogs';
import { HashService } from '../hash/hash.service';
import { InitiateChatWithUserUseCase } from './use-cases/initiate-chat-with-user.use-case';

const useCases = [InitiateChatWithUserUseCase]

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, BanUsersBlogsEntity])],
  controllers: [IntegrationsController],
  providers: [
    IntegrationService,
    TelegramAdapter,
    UsersRepository,
    HashService,
    ...useCases
  ]
})
export class IntegrationsModule {}
