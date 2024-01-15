import { Module, forwardRef } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { EmailsRepository } from '../emails/emails.repository'
import { EmailsModule } from '../emails/emails.module'
import { EmailManagerRepository } from '../email-manager/email-manager.repository'
import { MailAdapterRepository } from '../email-adapter/email-adapter.repository'
import { JWTService } from '../jwt/jwt.service'
import { JWTStrategy } from './strategies/jwt.strategy'
import { HashService } from '../hash/hash.service'
import { DevicesRepository } from '../devices/devices.repository'
import { AuthRepository } from './auth.repository'
import { AuthController } from './auth.controller'
import { UsersSQLRepository } from '../users/users.repository.sql'
import { LocalSqlStrategy } from './strategies/local.strategy'

@Module({
  imports: [
    forwardRef(() => EmailsModule),
    forwardRef(() => JwtModule)
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
    UsersSQLRepository,
    LocalSqlStrategy,
    JWTStrategy,
    HashService,
    DevicesRepository
  ]
})
export class AuthModule {}
