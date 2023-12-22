import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  HttpCode,
  Req,
  UnauthorizedException,
  HttpException,
  ForbiddenException,
} from '@nestjs/common'
import { Request } from 'express'
import { DevicesRepository } from './devices.repository'
import { JWTService } from '../jwt/jwt.service'
import { RoutesEnum } from '../constants/global'
import { IDevice } from '../types/devices'
import { appMessages } from '../constants/messages'

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
  async deleteAllDevices(@Req() request: Request): Promise<any> {
    const token = request.cookies.refreshToken

    if (!token) {
      throw new UnauthorizedException()
    }

    const { userId, deviceId, lastActiveDate } =
      await this.JWTService.verifyRefreshToken(token)

    if (!userId || !deviceId || !lastActiveDate) {
      throw new UnauthorizedException()
    }

    await this.devicesRepository.deleteDevices(userId, lastActiveDate)
    return
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceById(
    @Param() params: { deviceId: string },
    @Req() request: Request
  ): Promise<undefined> {
    const token = request.cookies.refreshToken

    if (!token) {
      throw new UnauthorizedException()
    }

    const device = await this.devicesRepository.getDeviceByDeviceId(params.deviceId)

    if (!device) {
      throw new HttpException(
        { message: appMessages(appMessages().device).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    const { userId, deviceId, lastActiveDate } =
      await this.JWTService.verifyRefreshToken(token)

    if (!userId || !deviceId || !lastActiveDate) {
      throw new UnauthorizedException()
    }

    const existedDevice = await this.devicesRepository.getDeviceByDate(lastActiveDate)

    if (!existedDevice) {
      throw new UnauthorizedException()
    }

    if (device.userId !== userId) {
      throw new ForbiddenException()
    }

    const deletedDevice = await this.devicesRepository.deleteDevice(params.deviceId)

    if (!deletedDevice) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    return
  }
}
