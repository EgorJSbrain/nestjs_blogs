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
} from '@nestjs/common'
import { Response, Request } from 'express'
import { CreateUserDto } from 'src/dtos/users/create-user.dto'
import { UsersRepository } from 'src/users/users.repository'
import { AuthRepository } from './auth.repository'
import { LoginDto } from 'src/dtos/auth/login.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private authRepository: AuthRepository,
    private usersRepository: UsersRepository
  ) {}

  @Get('me')
  async getMe(): Promise<any> {
    return '-Me-'
  }

  @Post('login')
  async login(@Res({ passthrough: true }) response: Response, @Req() request: Request, @Ip() ip: string, @Body() data: LoginDto): Promise<any> {
    const userIp = ip
    const deviceTitle = request.headers['user-agent']

    const tokens = await this.authRepository.login(data)

    if (!tokens) {
      throw new HttpException({ message: "Something wrong" }, HttpStatus.NOT_FOUND)
    }

    response.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true })
    return { accessToken: tokens?.accessToken }
  }

  // @Post('refresh-token')
  // async refreshToken(@Body() data: any): Promise<any> {
   
  // }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() data: CreateUserDto): Promise<any> {
    const user = this.authRepository.register(data)

    if (!user) {
      throw new HttpException({ message: "Something wrong" }, HttpStatus.NOT_FOUND)
    }
  }

  // @Post('registration-confirmation')
  // async registrationConfirmation(@Body() data: any): Promise<any> {
   
  // }

  // @Post('registration-email-resending')
  // async registrationEmailResending(@Body() data: any): Promise<any> {
   
  // }

  // @Post('logout')
  // async logout() {
   
  // }
}
