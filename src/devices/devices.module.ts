import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DevicesRepository } from './devices.repository';
import { DevicesController } from './devices.controller';
import { JWTService } from '../jwt/jwt.service';
import { DeviceEntity } from '../entities/devices';
import { DevicesService } from './devices.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEntity])],
  controllers: [DevicesController],
  providers: [
    JwtService,
    JWTService,
    ConfigService,
    DevicesRepository,
    DevicesService,
  ]
})

export class DeviceModule {}
