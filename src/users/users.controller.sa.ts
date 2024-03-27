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
  UseGuards,
  Put
} from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InjectDataSource } from '@nestjs/typeorm'

import { BasicAuthGuard } from '../auth/guards/basic-auth.guard'
import { CreateUserDto } from '../dtos/users/create-user.dto'
import { UsersRequestParams } from '../types/users'
import { IUser } from '../types/users'
import { RoutesEnum } from '../constants/global'
import { appMessages } from '../constants/messages'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'
import { BanUserDto } from '../dtos/users/ban-user.dto'

@SkipThrottle()
@Controller(RoutesEnum.saUsers)
export class UsersSAController {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private usersRepository: UsersRepository,
    private usersService: UsersService
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAll(@Query() query: UsersRequestParams): Promise<any> {
    const users = await this.usersService.getAll(query)

    return users
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async creatUser(@Body() data: CreateUserDto): Promise<IUser | null> {
    const user = await this.usersRepository.createUser(data)

    if (!user) {
      return null
    }

    return {
      id: user!.id,
      login: user!.login,
      email: user!.email,
      createdAt: user!.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      }
    }
  }

  @Put(':id/ban')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(
    @Param() params: { id: string },
    @Body() data: BanUserDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner()

    try {
      const { id } = params
      await queryRunner.connect()
      await queryRunner.startTransaction()
      const manager = queryRunner.manager

      const user = await this.usersRepository.getById(id)

      if (!user) {
        throw new HttpException(
          { message: appMessages(appMessages().user).errors.notFound },
          HttpStatus.NOT_FOUND
        )
      }

      await this.usersService.banUnbanUser(
        id,
        data,
        manager
      )

      await queryRunner.commitTransaction()
    } catch (err) {
      await queryRunner.rollbackTransaction()

      throw new HttpException(
        {
          message: err.message || appMessages().errors.somethingIsWrong,
          field: ''
        },
        err.status || HttpStatus.BAD_REQUEST
      )
    } finally {
      await queryRunner.release()
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

    await this.usersRepository.deleteById(params.id)
  }
}
