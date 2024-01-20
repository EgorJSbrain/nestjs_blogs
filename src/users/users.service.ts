import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { v4 } from 'uuid'

import { SortDirectionsEnum } from '../constants/global'
import { CreateUserDto } from '../dtos/users/create-user.dto'
import { HashService } from '../hash/hash.service'
import { IExtendedUser, IUser, UsersRequestParams } from '../types/users'
import { UsersRepository } from './users.repository'

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private hashService: HashService
  ) {}

  async getAll(params: UsersRequestParams) {
    return await this.usersRepository.getAll(params)
  }

  async getById(id: string) {
    return await this.usersRepository.getById(id)
  }

  async getUserByLoginOrEmail(
    loginOrEmail: string
  ) {
    return await this.usersRepository.getUserByLoginOrEmail(loginOrEmail)
  }

  async getUserByEmail(email: string) {
    return await this.usersRepository.getUserByEmail(email)
  }

  async createUser(data: CreateUserDto) {
    return await this.usersRepository.createUser(data)
  }

  async getUserByVerificationCode(code: string) {
    return await this.usersRepository.getUserByVerificationCode(code)
  }

  async confirmEmailOfUser(id: string) {
    return await this.usersRepository.confirmEmailOfUser(id)
  }

  async setNewConfirmationCodeOfUser(code: string, id: string) {
    return await this.usersRepository.setNewConfirmationCodeOfUser(code, id)
  }
  async setNewHashesOfUser(passwordHash: string, passwordSalt: string, id: string) {
    return await this.usersRepository.setNewHashesOfUser(passwordHash, passwordSalt, id)
  }

  async deleteById(id: string) {
    return await this.usersRepository.deleteById(id)
  }
}
