import { Module, forwardRef } from '@nestjs/common';
import { EmailsRepository } from './emails.repository';
import { EmailManagerRepository } from '../email-manager/email-manager.repository';
import { EmailManagerModule } from '../email-manager/email-manager.module';
import { MailAdapterRepository } from '../email-adapter/email-adapter.repository';

@Module({
  imports: [forwardRef(() => EmailManagerModule)],
  controllers: [],
  providers: [
    MailAdapterRepository,
    EmailManagerRepository,
    EmailsRepository,
  ]
})

export class EmailsModule {}
