import { Module } from '@nestjs/common';
import { MailAdapterRepository } from './email-adapter.repository';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [],
  providers: [
    MailAdapterRepository,
    ConfigService,
  ]
})

export class EmailAdapterModule {}
