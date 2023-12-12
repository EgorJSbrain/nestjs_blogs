import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LikesRepository } from './likes.repository';
import { Like, LikeSchema } from './likes.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Like.name, schema: LikeSchema },
  ])],
  providers: [LikesRepository]
})

export class LikesModule {}
