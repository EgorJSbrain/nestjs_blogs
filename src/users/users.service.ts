import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'

import { CreateUserDto } from '../dtos/users/create-user.dto'
import { UserBanData, UsersRequestParams } from '../types/users'
import { UsersRepository } from './users.repository'
import { DevicesRepository } from '../devices/devices.repository'

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private devicesRepository: DevicesRepository,
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

  async banUnbanUser(userId: string, data: UserBanData, manager: EntityManager) {
    await this.usersRepository.banUnbanUser(userId, data, manager)

    await this.devicesRepository.deleteDevicesbyUserIdForSA(userId, manager)
  }
}
