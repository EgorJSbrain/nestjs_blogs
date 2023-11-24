import { Module, forwardRef } from '@nestjs/common';
import { EmailsRepository } from './emails.repository';
import { EmailManagerRepository } from 'src/email-manager/email-manager.repository';
import { EmailManagerModule } from 'src/email-manager/email-manager.module';
import { MailAdapterRepository } from 'src/email-adapter/email-adapter.repository';

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
