import { Module, forwardRef } from '@nestjs/common';
import { JwtModule as JwtModule, JwtService as NestJwtService } from '@nestjs/jwt';

import { JwtRepository } from './jwt.repository';


@Module({
  imports: [
    JwtModule.register({
      secret: 'tik-tik-key', // Replace with a strong and secret key
      signOptions: { expiresIn: '5m' } // Set the expiration time for the token
    })
  ],
  controllers: [],
  providers: [
    JwtRepository,
  ]
})
export class JWTModule {}
