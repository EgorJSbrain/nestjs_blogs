import { Module, forwardRef } from '@nestjs/common';
import { JwtModule as JwtModule, JwtService as NestJwtService } from '@nestjs/jwt';

import { JwtRepository } from './jwt.repository';


@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_SECRET_KEY,
      signOptions: { expiresIn: '5m' } // Set the expiration time for the token
    })
  ],
  controllers: [],
  providers: [
    JwtRepository,
  ]
})
export class JWTModule {}
