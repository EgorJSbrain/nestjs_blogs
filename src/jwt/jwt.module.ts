import { Module } from '@nestjs/common';
import { JwtModule as JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { JwtRepository } from './jwt.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('ACCESS_SECRET_KEY'),
        signOptions: { expiresIn: '10s' }
      }),
    })
  ],
  controllers: [],
  providers: [
    JwtRepository,
    ConfigService
  ]
})
export class JWTModule {}
