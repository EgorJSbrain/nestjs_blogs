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
    private jwtRepository: JwtRepository,
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
        { message: 'Email or password aren\'t correct' },
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
  async refreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response,) {
    const token = request.cookies.refreshToken

    if (!token) {
      throw new UnauthorizedException()
    }

    const { userId, password } = await this.jwtRepository.verifyRefreshToken(token)

    if (!userId || !password) {
      throw new UnauthorizedException()
    }

    const { accessToken, refreshToken } =
      await this.authRepository.refreshToken(userId, password)

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true
    })

    return { accessToken }
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() data: { email: string }) {
    if (!data.email) {
      throw new HttpException(
        { message: 'Email is required field' },
        HttpStatus.NOT_FOUND
      )
    }

    const result = await this.authRepository.resendConfirmationEmail(data.email)

    if (!result) {
      throw new HttpException(
        { message: 'Something wrong' },
        HttpStatus.NOT_FOUND
      )
    }
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() request: Request) {
    if (!request.headers.authorization) {
      throw new UnauthorizedException()
    }

    const token = request.headers.authorization?.split(' ')[1]
    const bearer = request.headers.authorization?.split(' ')[0]

    if (bearer !== 'Bearer') {
      throw new UnauthorizedException()
    }

    if (!token) {
      throw new UnauthorizedException()
    }

    const { userId } = this.jwtRepository.verifyAccessToken(token)

    if (!userId) {
      throw new UnauthorizedException()
    }

    const user = await this.authRepository.getMe(userId)

    if (!user) {
      throw new HttpException(
        { message: 'User doesn\'t found' },
        HttpStatus.NOT_FOUND
      )
    }

    return user
  }

  // @Post('logout')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async logout(@Req() request: Request, @Res() response: Response) {
  //   const token = request.cookies.refreshToken

  //   if (!token) {
  //     throw new UnauthorizedException()
  //   }

  //   const { userId } = await this.jwtRepository.verifyRefreshToken(token)
  //   console.log("userId:", userId)

  //   // if (!userId) {
  //   //   throw new UnauthorizedException()
  //   // }

  //   // response.clearCookie('refreshToken')
  //   return {}
  // }
}
