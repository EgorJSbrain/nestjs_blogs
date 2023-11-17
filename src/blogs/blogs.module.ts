import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsRepository } from './blogs.repository';
import { BlogsController } from './blogs.controller';
import { Blog, BlogSchema } from './blogs.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])],
  controllers: [BlogsController],
  providers: [BlogsRepository]
})

export class BlogsModule {}
