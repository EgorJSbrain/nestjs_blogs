import { Module } from '@nestjs/common';
import { ConfigurationRepository } from 'src/configuration/configuration.repository';
import { MailRepository } from './mail.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    ConfigurationRepository,
    MailRepository,
  ]
})

export class MailModule {}
