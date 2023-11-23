import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthRepository } from './auth.repository';
import { AuthController } from './auth.controller';
import { UsersRepository } from 'src/users/users.repository';
import { User, UserSchema } from 'src/users/users.schema';
// import { MailService } from 'src/mail/mail.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    UsersRepository,
    // MailService
  ]
})

export class AuthModule {}
