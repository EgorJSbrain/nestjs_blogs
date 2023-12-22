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
import { AuthRepository } from './auth.repository'
import { LoginDto } from '../dtos/auth/login.dto'
import { JWTService } from '../jwt/jwt.service'
import { LocalGuard } from './guards/local-auth.guard'
import { JWTAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUserId } from './current-user-id.param.decorator'
import { UsersRepository } from '../users/users.repository'
import { appMessages } from '../constants/messages'
import { DevicesRepository } from '../devices/devices.repository'
import { Throttle } from '@nestjs/throttler'

// @Throttle({ default: { limit: 3, ttl: 10000 } })
@Controller('auth')
export class AuthController {
  constructor(
    private authRepository: AuthRepository,
    private JWTService: JWTService,
    private usersRepository: UsersRepository,
    private devicesRepository: DevicesRepository,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalGuard)
  async login(
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
    @Ip() ip: string,
    @Body() data: LoginDto
  ) {
    const deviceTitle = req.headers['user-agent']

    const accessToken = this.JWTService.generateAcessToken(req.user?.userId)

    if (!accessToken) {
      throw new UnauthorizedException({ message: 'Email or password aren\'t correct' })
    }

    const device = await this.devicesRepository.createDevice({
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
        { message: 'Login is used yet', field: 'login' },
        HttpStatus.BAD_REQUEST
      )
    }

    const existedUserByEmail = await this.usersRepository.getUserByLoginOrEmail(data.email)

    if (existedUserByEmail) {
      throw new HttpException(
        { message: 'Email is used yet', field: 'email' },
        HttpStatus.BAD_REQUEST
      )
    }

    const user = this.authRepository.register(data)

    if (!user) {
      throw new HttpException(
        { message: 'Something wrong', field: '' },
        HttpStatus.NOT_FOUND
      )
    }

    return
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() data: { code: string }) {
    const isConfirmedYet = await this.authRepository.checkIsConfirmedEmail(data.code)

    if (isConfirmedYet) {
      throw new HttpException(
        { message: 'Email is confirmed yet', field: 'code' },
        HttpStatus.BAD_REQUEST
      )
    }

    const isConfirmed = await this.authRepository.confirmEmail(data.code)

    if (!isConfirmed) {
      throw new HttpException(
        { message: 'Something wrong', field: 'code' },
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
        { message: 'Something wrong', field: '' },
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
        { message: 'Something wrong', field: '' },
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
        { message: 'Email is required field', field: 'email'},
        HttpStatus.BAD_REQUEST
      )
    }

    const existedUser = await this.usersRepository.getUserByEmail(data.email)

    if (!existedUser) {
      throw new HttpException(
        { message: 'This email doesn\'t exist', field: 'email' },
        HttpStatus.BAD_REQUEST
      )
    }

    if (existedUser?.isConfirmed) {
      throw new HttpException(
        { message: appMessages().errors.emailIsConfirmed, field: 'email' },
        HttpStatus.BAD_REQUEST
      )
    }

    const result = await this.authRepository.resendConfirmationEmail(data.email)

    if (!result) {
      throw new HttpException(
        { message: appMessages().errors.somethingIsWrong, field: 'email' },
        HttpStatus.BAD_REQUEST
      )
    }

    return
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAuthGuard)
  async getMe(@CurrentUserId() currentUseruserId: string) {
    const user = await this.authRepository.getMe(currentUseruserId)

    if (!user) {
      throw new HttpException(
        { message: 'User doesn\'t found', field: '' },
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

    const existedUser = this.usersRepository.getById(userId)

    if (!existedUser) {
      throw new UnauthorizedException()
    }

    const existedDevice = await this.devicesRepository.getDeviceByDate(lastActiveDate)

    if (!existedDevice) {
      throw new UnauthorizedException()
    }

    const updatedDevice = await this.devicesRepository.updateDevice(existedDevice.lastActiveDate)

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

    const existedDevice = await this.devicesRepository.getDeviceByDate(lastActiveDate)

    if (!existedDevice) {
      throw new UnauthorizedException()
    }

    const deletedDevice = await this.devicesRepository.deleteDevice(deviceId)
    console.log("deletedDevice:", deletedDevice)

    // TODO clear cookie
    // response.clearCookie('refreshToken')
    return
  }
}
