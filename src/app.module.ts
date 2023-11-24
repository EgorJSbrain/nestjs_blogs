import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { GeneralModule } from './general/general.module';
import { AuthModule } from './auth/auth.module';
import { EmailAdapterModule } from './email-adapter/email-adapter.module';
import { EmailsModule } from './emails/emails.module';
import { EmailManagerModule } from './email-manager/email-manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env` }),
    MongooseModule.forRoot(process.env.DATABASE_URL ?? ''),
    UsersModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    GeneralModule,
    AuthModule,
    EmailAdapterModule,
    EmailsModule,
    EmailManagerModule
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
