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
  HttpException
} from '@nestjs/common'
import { UsersRepository } from './users.repository'
import { User, UserDocument } from './users.schema'
import { CreateUserDto } from 'src/dtos/users/create-user.dto'
import { UsersRequestParams } from '../types/users'
import { ResponseBody } from '../types/request'
import { IUser } from './types/user'

@Controller('users')
export class UsersController {
  constructor(private usersRepository: UsersRepository) {}

  @Get()
  async getAll(
    @Query() query: UsersRequestParams
  ): Promise<ResponseBody<UserDocument> | []> {
    const users = await this.usersRepository.getAll(query)

    return users
  }

  @Get(':id')
  async getById(@Param() params: { id: string }): Promise<UserDocument | null> {
    const user = await this.usersRepository.getById(params.id)

    if (!user) {
      throw new HttpException({ message: "User doesn't exist" }, HttpStatus.NOT_FOUND)
    }

    return user
  }

  @Post()
  async creatUser(@Body() data: CreateUserDto): Promise<UserDocument> {
    return this.usersRepository.createUser(data)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param() params: { id: string }): Promise<undefined> {
    const user = await this.usersRepository.getById(params.id)

    if (!user) {
      throw new HttpException({ message: "User doesn't exist" }, HttpStatus.NOT_FOUND)
    }

    await this.usersRepository.deleteUser(params.id)
  }
}
