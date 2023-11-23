import { Module } from '@nestjs/common';

import { ConfigurationRepository } from './configuration.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    ConfigurationRepository,
  ]
})

export class ConfigurationModule {}
