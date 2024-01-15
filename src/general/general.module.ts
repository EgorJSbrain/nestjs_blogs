import { Module } from '@nestjs/common';

import { GenerealController } from './general.controller';
import { GeneralSqlRepository } from './general.sql.repository';

@Module({
  controllers: [GenerealController],
  providers: [GeneralSqlRepository]
})

export class GeneralModule {}
