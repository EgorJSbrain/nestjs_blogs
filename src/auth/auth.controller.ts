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
import { LoginDto } from 'src/dtos/auth/login.dto'
import { JwtRepository } from 'src/jwt/jwt.repository'
import { LocalGuard } from './guards/local-auth.guard'
import { JWTAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUserId } from './current-user-id.param.decorator'
import { UsersRepository } from 'src/users/users.repository'

@Controller('auth')
export class AuthController {
  constructor(
    private authRepository: AuthRepository,
    private jwtRepository: JwtRepository,
    private usersRepository: UsersRepository,
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
    const userIp = ip
    const deviceTitle = req.headers['user-agent']

    const tokens = await this.authRepository.login(req.user?.userId, data.password)

    if (!tokens) {
      throw new UnauthorizedException({ message: 'Email or password aren\'t correct' })
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
    const existedUserByLogin = await this.usersRepository.getUserByLoginOrEmail(data.login, data.login)

    if (existedUserByLogin) {
      throw new HttpException(
        { message: 'Login is used yet', field: 'login' },
        HttpStatus.BAD_REQUEST
      )
    }

    const existedUserByEmail = await this.usersRepository.getUserByLoginOrEmail(data.email, data.email)

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
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() data: { code: string }) {
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
        { message: 'This email is conformed', field: 'email' },
        HttpStatus.BAD_REQUEST
      )
    }

    const result = await this.authRepository.resendConfirmationEmail(data.email)

    if (!result) {
      throw new HttpException(
        { message: 'Something wrong', field: '' },
        HttpStatus.BAD_REQUEST
      )
    }
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
