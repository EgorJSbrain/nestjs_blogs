import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User, UserDocument } from './users.schema';
import { CreateUserDto } from 'src/dtos/users/create-user.dto';
import { UsersRequestParams } from 'src/types/users';
import { ResponseBody } from '../../src/types/request';

@Controller('users')
export class UsersController {
  constructor(private usersRepository: UsersRepository) {}

  @Get()
  async getAll(@Query() query: UsersRequestParams):Promise<ResponseBody<UserDocument> | []> {
    const users = await this.usersRepository.getAll(query)

    return users
  }

  @Get(':id')
  async getById(@Param()  params: { id: string }): Promise<User | null> {
    const user = await this.usersRepository.getById(params.id)

    return user
  }

  @Post()
  async creatUser(@Body() data: CreateUserDto): Promise<any> {
    return this.usersRepository.createUser(data)
  }

  @Delete(':id')
  async deleteUser(@Param()  params: { id: string }): Promise<any> {
    return this.usersRepository.deleteUser(params.id)
  }
}
