import { Module, forwardRef } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EmailsRepository } from '../emails/emails.repository'
import { EmailsModule } from '../emails/emails.module'
import { EmailManagerRepository } from '../email-manager/email-manager.repository'
import { MailAdapterRepository } from '../email-adapter/email-adapter.repository'
import { JWTService } from '../jwt/jwt.service'
import { JWTStrategy } from './strategies/jwt.strategy'
import { HashService } from '../hash/hash.service'
import { AuthRepository } from './auth.repository'
import { AuthController } from './auth.controller'
import { UsersRepository } from '../users/users.repository'
import { LocalSqlStrategy } from './strategies/local.strategy'
import { UserEntity } from '../entities/user'
import { DevicesService } from '../devices/devices.service'
import { DeviceEntity } from '../entities/devices'
import { DevicesRepository } from '../devices/devices.repository'
import { BanUsersBlogsEntity } from '../entities/ban-users-blogs'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, DeviceEntity, BanUsersBlogsEntity]),
    forwardRef(() => EmailsModule),
    forwardRef(() => JwtModule),
  ],
  controllers: [
    AuthController
  ],
  providers: [
    MailAdapterRepository,
    EmailManagerRepository,
    JWTService,
    EmailsRepository,
    AuthRepository,
    UsersRepository,
    LocalSqlStrategy,
    JWTStrategy,
    HashService,
    DevicesService,
    DevicesRepository,
  ]
})

export class AuthModule {}
