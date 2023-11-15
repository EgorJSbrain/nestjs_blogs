import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './users.schema';
import { CreateUserDto } from 'src/dtos/users/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersRepository: UsersRepository) {}

  @Get()
  async getAll(): Promise<User[]> {
    const users = await this.usersRepository.getAll()

    return users
  }

  @Get(':id')
  async getById(@Param()  params: { id: string }): Promise<User> {
    const user = await this.usersRepository.getById(params.id)

    return user as any
  }

  @Post()
  async creatUser(@Body() data: CreateUserDto): Promise<string> {
    console.log("----", data)

    return ''
  }
}
