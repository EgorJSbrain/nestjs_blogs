import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GeneralRepository } from './general.repository';
import { GenerealController } from './general.controller';
import { Blog, BlogSchema } from 'src/blogs/blogs.schema';
import { Post, PostSchema } from 'src/posts/posts.schema';
import { Comment, CommentSchema } from 'src/comments/comments.schema';
import { User, UserSchema } from 'src/users/users.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Blog.name, schema: BlogSchema },
    { name: Post.name, schema: PostSchema },
    { name: Comment.name, schema: CommentSchema },
    { name: User.name, schema: UserSchema }
  ])],
  controllers: [GenerealController],
  providers: [GeneralRepository]
})

export class GeneralModule {}
