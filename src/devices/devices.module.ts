import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { DevicesRepository } from './devices.repository';
import { DevicesController } from './devices.controller';
import { Device, DeviceSchema } from './devices.schema';
import { JWTService } from '../jwt/jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([
    { name: Device.name, schema: DeviceSchema },
  ]),
],
  controllers: [DevicesController],
  providers: [
    JwtService,
    JWTService,
    ConfigService,
    DevicesRepository,
  ]
})

export class DeviceModule {}
