import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  HttpCode,
  Req,
  UnauthorizedException
} from '@nestjs/common'
import { Request } from 'express'
import { DevicesRepository } from './devices.repository'
import { JWTService } from '../jwt/jwt.service'
import { RoutesEnum } from '../constants/global'
import { IDevice } from '../types/devices'

@Controller(RoutesEnum.devices)
export class DevicesController {
  constructor(
    private devicesRepository: DevicesRepository,
    private JWTService: JWTService
  ) {}

  @Get()
  async getAllDevicesByUserId(
    @Req() req: Request
  ): Promise<IDevice[] | []> {
    const token = req.cookies.refreshToken

    if (!token) {
      throw new UnauthorizedException()
    }

    const { userId } = await this.JWTService.verifyRefreshToken(token)

    if (!userId) {
      throw new UnauthorizedException()
    }

    const devices = await this.devicesRepository.getAllDevicesByUserId(userId)

    return devices
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllDevices(): Promise<any> {
    console.log("deleteAllDevices:")
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceById(@Param() params: { deviceId: string }): Promise<any> {
    console.log("deviceId:", params.deviceId)
  }

}
