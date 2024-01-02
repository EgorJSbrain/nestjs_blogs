import { SkipThrottle } from '@nestjs/throttler'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  HttpException,
  UseGuards
} from '@nestjs/common'
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard'
import { UsersRepository } from './users.repository'
import { UserDocument } from './users.schema'
import { CreateUserDto } from '../dtos/users/create-user.dto'
import { UsersRequestParams } from '../types/users'
import { ResponseBody } from '../types/request'
import { IUser } from '../types/users'
import { RoutesEnum } from '../constants/global'
import { appMessages } from '../constants/messages'
import { UsersSQLRepository } from './users.sql.repository'

@SkipThrottle()
@Controller(RoutesEnum.saUsers)
export class UsersController {
  constructor(
    private usersRepository: UsersRepository,
    private usersSqlRepository: UsersSQLRepository
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAll(
    @Query() query: UsersRequestParams
  ): Promise<any> {
    const users = await this.usersSqlRepository.getAll()

    return users
  }

  // @Get()
  // @UseGuards(BasicAuthGuard)
  // async getAll(
  //   @Query() query: UsersRequestParams
  // ): Promise<ResponseBody<UserDocument> | null> {
  //   const users = await this.usersRepository.getAll(query)

  //   return users
  // }

  @Get(':id')
  async getById(@Param() params: { id: string }): Promise<UserDocument | null> {
    const user = await this.usersRepository.getById(params.id)

    if (!user) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    return user
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async creatUser(@Body() data: CreateUserDto): Promise<IUser> {
    const user = await this.usersRepository.createUser(data)

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteUser(@Param() params: { id: string }): Promise<undefined> {
    const user = await this.usersRepository.getById(params.id)

    if (!user) {
      throw new HttpException(
        { message: appMessages(appMessages().user).errors.notFound },
        HttpStatus.NOT_FOUND
      )
    }

    await this.usersRepository.deleteUser(params.id)
  }
}
