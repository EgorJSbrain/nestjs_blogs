import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GeneralRepository } from './general.repository';
import { GenerealController } from './general.controller';
import { Blog, BlogSchema } from '../blogs/blogs.schema';
import { Post, PostSchema } from '../posts/posts.schema';
import { Comment, CommentSchema } from '../comments/comments.schema';
import { User, UserSchema } from '../users/users.schema';
import { GeneralSqlRepository } from './general.sql.repository';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Blog.name, schema: BlogSchema },
    { name: Post.name, schema: PostSchema },
    { name: Comment.name, schema: CommentSchema },
    { name: User.name, schema: UserSchema }
  ])],
  controllers: [GenerealController],
  providers: [GeneralSqlRepository]
  // providers: [GeneralRepository]
})

export class GeneralModule {}
