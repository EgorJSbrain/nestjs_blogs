import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { AuthRepository } from './auth.repository';
import { AuthController } from './auth.controller';
import { UsersRepository } from '../users/users.repository';
import { User, UserSchema } from '../users/users.schema';
import { EmailsRepository } from '../emails/emails.repository';
import { EmailsModule } from '../emails/emails.module';
import { EmailManagerRepository } from '../email-manager/email-manager.repository';
import { MailAdapterRepository } from '../email-adapter/email-adapter.repository';
import { JWTService } from '../jwt/jwt.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JWTStrategy } from './strategies/jwt.strategy';
import { HashService } from '../hash/hash.service';
import { DevicesRepository } from '../devices/devices.repository';
import { Device, DeviceSchema } from '../devices/devices.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
    forwardRef(() => EmailsModule),
    forwardRef(() => JwtModule)
  ],
  controllers: [AuthController],
  providers: [
    MailAdapterRepository,
    EmailManagerRepository,
    JWTService,
    EmailsRepository,
    AuthRepository,
    UsersRepository,
    LocalStrategy,
    JWTStrategy,
    HashService,
    DevicesRepository,
  ]
})

export class AuthModule {}
