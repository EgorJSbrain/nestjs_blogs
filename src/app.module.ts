import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService as NestJwtService } from '@nestjs/jwt';

import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { GeneralModule } from './general/general.module';
import { AuthModule } from './auth/auth.module';
import { EmailAdapterModule } from './email-adapter/email-adapter.module';
import { EmailsModule } from './emails/emails.module';
import { EmailManagerModule } from './email-manager/email-manager.module';
import { JWTModule } from './jwt/jwt.module';
import configuration from '../config/configuration';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.env.NODE_ENV}.env`,
      isGlobal: true,
      load: [configuration]
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DATABASE.URL')
      })
    }),
    UsersModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    GeneralModule,
    AuthModule,
    EmailAdapterModule,
    EmailsModule,
    EmailManagerModule,
    JWTModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
