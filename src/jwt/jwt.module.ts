import { Module } from '@nestjs/common';
import { JwtModule as JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { JWTService } from './jwt.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('ACCESS_SECRET_KEY'),
        signOptions: { expiresIn: '30m' }
      }),
    }),
  ],
  controllers: [],
  providers: [
    JWTService,
    ConfigService
  ]
})
export class JWTModule {}
