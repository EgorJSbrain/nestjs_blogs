import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthRepository } from './auth.repository';
import { AuthController } from './auth.controller';
import { UsersRepository } from 'src/users/users.repository';
import { User, UserSchema } from 'src/users/users.schema';
import { EmailsRepository } from 'src/emails/emails.repository';
import { EmailsModule } from 'src/emails/emails.module';
import { EmailManagerRepository } from 'src/email-manager/email-manager.repository';
import { MailAdapterRepository } from 'src/email-adapter/email-adapter.repository';
// import { MailService } from 'src/mail/mail.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => EmailsModule)
  ],
  controllers: [AuthController],
  providers: [
    MailAdapterRepository,
    EmailManagerRepository,
    EmailsRepository,
    AuthRepository,
    UsersRepository,
  ]
})

export class AuthModule {}
