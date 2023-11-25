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
} from '@nestjs/common'
import { CreateUserDto } from 'src/dtos/users/create-user.dto'
import { UsersRepository } from 'src/users/users.repository'
import { AuthRepository } from './auth.repository'

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
  async login(@Req() request: Request, @Ip() ip): Promise<any> {
    const userIp = ip
    const deviceTitle = request.headers['user-agent']
    return '-1-'
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
