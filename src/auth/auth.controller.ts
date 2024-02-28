import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'

import { CreateUserDto } from '../dtos/users/create-user.dto'
import { LoginDto } from '../dtos/auth/login.dto'
import { JWTService } from '../jwt/jwt.service'
import { LocalGuard } from './guards/local-auth.guard'
import { JWTAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUserId } from './current-user-id.param.decorator'
import { appMessages } from '../constants/messages'
import { UsersRepository } from '../users/users.repository'
import { AuthRepository } from './auth.repository'
import { RoutesEnum } from '../constants/global'
import { DevicesService } from '../devices/devices.service'
import { SkipThrottle } from '@nestjs/throttler'

@SkipThrottle()
@Controller(RoutesEnum.auth)
export class AuthController {
  constructor(
    private authRepository: AuthRepository,
    private JWTService: JWTService,
    private usersRepository: UsersRepository,
    private devicesService: DevicesService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalGuard)
  async login(
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    const deviceTitle = req.headers['user-agent']

    const accessToken = this.JWTService.generateAcessToken(req.user?.userId)

    if (!accessToken) {
      throw new UnauthorizedException({
        message: appMessages().errors.emailOrPasswordNotCorrect
      })
    }

    const device = await this.devicesService.createDevice({
      ip,
      title: deviceTitle ?? 'device_title',
      userId: req.user?.userId
    })

    const refreshToken = this.JWTService.generateRefreshToken(
      device?.userId ?? '',
      device?.lastActiveDate ?? '',
      device?.deviceId ?? ''
    )
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true
    })

    return { accessToken }
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() data: CreateUserDto) {
    const existedUserByLogin = await this.usersRepository.getUserByLoginOrEmail(data.login)

    if (existedUserByLogin) {
      throw new HttpException(
        { message: appMessages().info.loginIsUsedYet, field: 'login' },
        HttpStatus.BAD_REQUEST
      )
    }

    const existedUserByEmail = await this.usersRepository.getUserByLoginOrEmail(data.email)

    if (existedUserByEmail) {
      throw new HttpException(
        { message: appMessages().info.emailIsUsedYet, field: appMessages().email },
        HttpStatus.BAD_REQUEST
      )
    }

    const user = await this.authRepository.register(data)

    if (!user) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    return
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() data: { code: string }) {
    if (!data.code) {
      throw new HttpException(
        { message: appMessages(appMessages().code).errors.isRequiredParameter, field: appMessages().code},
        HttpStatus.BAD_REQUEST
      )
    }

    const existedUser = await this.authRepository.getUserByVerificationCode(data.code)

    if (!existedUser) {
      throw new HttpException(
        { message: appMessages().errors.codeIsNotCorrect, field: appMessages().code },
        HttpStatus.BAD_REQUEST
      )
    }

    if (existedUser && existedUser.isConfirmed) {
      throw new HttpException(
        { message: appMessages().errors.emailIsConfirmed, field: appMessages().code },
        HttpStatus.BAD_REQUEST
      )
    }

    const isConfirmed = await this.authRepository.confirmEmail(existedUser.id)

    if (!isConfirmed) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: appMessages().code },
        HttpStatus.BAD_REQUEST
      )
    }
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() data: { email: string }) {
    const passwordChangingResult = await this.authRepository.recoveryPassword(data.email)

    if (!passwordChangingResult) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    return
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() data: { newPassword: string, recoveryCode: string }) {
    const passwordChangingResult = await this.authRepository.newPassword(
      data.newPassword,
      data.recoveryCode
    )

    if (!passwordChangingResult) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    return
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() data: { email: string }) {
    if (!data.email) {
      throw new HttpException(
        { message: appMessages(appMessages().email).errors.isRequiredParameter, field: appMessages().email},
        HttpStatus.BAD_REQUEST
      )
    }

    const existedUser = await this.usersRepository.getUserByEmail(data.email)

    if (!existedUser) {
      throw new HttpException(
        { message: appMessages().errors.emailDoesntExist, field: appMessages().email },
        HttpStatus.BAD_REQUEST
      )
    }

    if (existedUser.isConfirmed) {
      throw new HttpException(
        { message: appMessages().errors.emailIsConfirmed, field: appMessages().email },
        HttpStatus.BAD_REQUEST
      )
    }

    await this.authRepository.resendConfirmationEmail(data.email)

    return
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  async getMe(@CurrentUserId() currentUseruserId: string) {
    const user = await this.authRepository.getMe(currentUseruserId)

    if (!user) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound, field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    return user
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response,) {
    const token = request.cookies.refreshToken

    if (!token) {
      throw new UnauthorizedException()
    }

    const { userId, deviceId, lastActiveDate } =
      await this.JWTService.verifyRefreshToken(token)

    if (!userId || !deviceId || !lastActiveDate) {
      throw new UnauthorizedException()
    }

    const existedUser = await this.usersRepository.getById(userId)

    if (!existedUser) {
      throw new UnauthorizedException()
    }

    const existedDevice = await this.devicesService.getDeviceByDate(lastActiveDate)

    if (!existedDevice) {
      throw new UnauthorizedException()
    }

    const updatedDevice = await this.devicesService.updateDevice(existedDevice.lastActiveDate)

    if (!updatedDevice) {
      throw new UnauthorizedException()
    }

    const accessToken = this.JWTService.generateAcessToken(userId)
    const refreshToken = this.JWTService.generateRefreshToken(userId, updatedDevice.lastActiveDate, deviceId)

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true
    })

    return { accessToken }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() request: Request) {
    const token = request.cookies.refreshToken

    if (!token) {
      throw new UnauthorizedException()
    }

    const { userId, deviceId, lastActiveDate } = await this.JWTService.verifyRefreshToken(token)

    if (!userId || !lastActiveDate || !deviceId) {
      throw new UnauthorizedException()
    }

    const existedUser = await this.usersRepository.getById(userId)

    if (!existedUser) {
      throw new UnauthorizedException()
    }

    const existedDevice = await this.devicesService.getDeviceByDate(lastActiveDate)

    if (!existedDevice) {
      throw new UnauthorizedException()
    }

    await this.devicesService.deleteDevice(deviceId)

    return
  }
}
