import { Module } from '@nestjs/common';
import { MailAdapterRepository } from './email-adapter.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    MailAdapterRepository,
  ]
})

export class EmailAdapterModule {}
