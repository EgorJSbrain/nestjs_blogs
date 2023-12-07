import { Module, forwardRef } from '@nestjs/common';
import { MailAdapterRepository } from '../email-adapter/email-adapter.repository';
import { EmailManagerRepository } from './email-manager.repository';
import { EmailAdapterModule } from '../email-adapter/email-adapter.module';

@Module({
  imports: [forwardRef(() => EmailAdapterModule)],
  controllers: [],
  providers: [
    MailAdapterRepository,
    EmailManagerRepository,
  ]
})

export class EmailManagerModule {}
