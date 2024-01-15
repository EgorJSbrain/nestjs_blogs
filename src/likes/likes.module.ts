import { Module } from '@nestjs/common';

import { LikesSqlRepository } from './likes.repository.sql';

@Module({
  providers: [LikesSqlRepository]
})

export class LikesModule {}
