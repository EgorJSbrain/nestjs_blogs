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
} from '@nestjs/common'
import { Response, Request } from 'express'
import { CreateUserDto } from 'src/dtos/users/create-user.dto'
import { UsersRepository } from 'src/users/users.repository'
import { AuthRepository } from './auth.repository'
import { LoginDto } from 'src/dtos/auth/login.dto'
import { JwtRepository } from 'src/jwt/jwt.repository'

@Controller('auth')
export class AuthController {
  constructor(
    private authRepository: AuthRepository,
    private jwtRepository: JwtRepository
  ) {}

  @Post('login')
  async login(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Ip() ip: string,
    @Body() data: LoginDto
  ) {
    const userIp = ip
    const deviceTitle = request.headers['user-agent']

    const tokens = await this.authRepository.login(data)

    if (!tokens) {
      throw new HttpException(
        { message: 'Something wrong' },
        HttpStatus.NOT_FOUND
      )
    }

    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true
    })
    return { accessToken: tokens?.accessToken }
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() data: CreateUserDto) {
    const user = this.authRepository.register(data)

    if (!user) {
      throw new HttpException(
        { message: 'Something wrong' },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() data: { code: string }) {
    const isConfirmed = await this.authRepository.confirmEmail(data.code)

    if (!isConfirmed) {
      throw new HttpException(
        { message: 'Something wrong' },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() data: { email: string }) {
    const passwordChangingResult = await this.authRepository.recoveryPassword(data.email)

    if (!passwordChangingResult) {
      throw new HttpException(
        { message: 'Something wrong' },
        HttpStatus.NOT_FOUND
      )
    }
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
        { message: 'Something wrong' },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() request: Request) {
    const token = request.cookies.refreshToken

    if (!token) {
      throw new UnauthorizedException()
    }

    if (!request.headers) {
      throw new UnauthorizedException()
    }
    const userId = await this.jwtRepository.verifyToken(token)
    console.log("----!!!!---userId:", userId)
  }

  // @Post('registration-email-resending')
  // async registrationEmailResending(@Body() data: any) {

  // }

  // @Get('me')
  // async getMe() {
  //   return '-Me-'
  // }

  // @Post('logout')
  // async logout() {

  // }
}
