import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { GeneralModule } from './general/general.module';
import { AuthModule } from './auth/auth.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env`, load: [configuration], isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE_URL ?? ''),
    UsersModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    GeneralModule,
    AuthModule,
    MailModule,
    ConfigurationModule
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
