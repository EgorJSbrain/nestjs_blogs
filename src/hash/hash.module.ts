import { Module } from '@nestjs/common';

import { HashService } from './hash.service';

@Module({
  imports: [],
  controllers: [],
  providers: [HashService]
})
export class HashModule {}
