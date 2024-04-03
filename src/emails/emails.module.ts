import { Module, forwardRef } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailManagerRepository } from '../email-manager/email-manager.repository';
import { EmailManagerModule } from '../email-manager/email-manager.module';
import { MailAdapterRepository } from '../email-adapter/email-adapter.repository';

@Module({
  imports: [forwardRef(() => EmailManagerModule)],
  controllers: [],
  providers: [
    MailAdapterRepository,
    EmailManagerRepository,
    EmailsService,
  ]
})

export class EmailsModule {}
