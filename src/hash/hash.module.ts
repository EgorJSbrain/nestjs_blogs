import { Module } from '@nestjs/common';

import { HashRepository } from './hash.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [HashRepository]
})
export class HashModule {}
