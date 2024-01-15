import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { DevicesRepository } from './devices.repository';
import { DevicesController } from './devices.controller';
import { JWTService } from '../jwt/jwt.service';

@Module({
  controllers: [DevicesController],
  providers: [
    JwtService,
    JWTService,
    ConfigService,
    DevicesRepository,
  ]
})

export class DeviceModule {}
