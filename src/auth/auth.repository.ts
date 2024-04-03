import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid'

import { EmailsService } from '../emails/emails.service';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { LoginDto } from '../dtos/auth/login.dto';
import { HashService } from '../hash/hash.service';
import { UsersRepository } from '../users/users.repository';
import { IExtendedUser, IUser } from '../types/users';

@Injectable()
export class AuthRepository {
  constructor(
    private emailsService: EmailsService,
    private usersRepository: UsersRepository,
    private hashService: HashService,
  ) {}

  async verifyUser(data: LoginDto): Promise<IUser | null> {
    const user = await this.usersRepository.getUserByLoginOrEmail(data.loginOrEmail)

    if (!user) {
      return null
    }

    const checkedPassword = await this.hashService.comparePassword(
      data.password,
      user.passwordHash
    )

    if (!checkedPassword) {
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

  async register(data: CreateUserDto): Promise<IExtendedUser | null> {
    const user = await this.usersRepository.createUser(data)

    if (!user) {
      return null
    }

    this.emailsService.sendRegistrationConfirmationMail(
      user.email,
      user.confirmationCode
    )

    return user
  }

  async confirmEmail(userId: string): Promise<boolean> {
    const confirmedUser = await this.usersRepository.confirmEmailOfUser(userId)

    if (!confirmedUser) {
      return false
    }

    return true
  }

  async getUserByVerificationCode(code: string): Promise<IExtendedUser | null> {
    const user = await this.usersRepository.getUserByVerificationCode(code)

    if (!user) {
      return null
    }

    return user
  }

  async recoveryPassword(email: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByEmail(email)

    if (!user) {
      return false
    }

    await this.usersRepository.setNewConfirmationCodeOfUser(v4(), user.id)

    return await this.emailsService.sendRecoveryPasswordMail(
      user.email,
      user.confirmationCode
    )
  }

  async newPassword(
    newPassword: string,
    recoveryCode: string
  ): Promise<boolean> {
    const user =
      await this.usersRepository.getUserByVerificationCode(recoveryCode)
    const { passwordSalt, passwordHash } =
      await this.hashService.generateHash(newPassword)

    if (!user) {
      return false
    }

    await this.usersRepository.setNewHashesOfUser(passwordHash, passwordSalt, user.id)

    return true
  }

  async getMe(userId: string): Promise<any> {
    const user = await this.usersRepository.getById(userId)

    if (!user) {
      return null
    }

    return {
      userId: user.id,
      email: user.email,
      login: user.login
    }
  }

  async resendConfirmationEmail(email: string): Promise<any> {
    const user = await this.usersRepository.getUserByEmail(email)

    if (!user) {
      return null
    }

    if (user.isConfirmed) {
      return null
    }

    const confirmationCode = v4()

    await this.usersRepository.setNewConfirmationCodeOfUser(confirmationCode, user.id)

    return await this.emailsService.sendRegistrationConfirmationMail(
      user.email,
      confirmationCode
    )
  }
}
