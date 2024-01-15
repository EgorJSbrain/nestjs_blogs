import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid'

import { EmailsRepository } from '../emails/emails.repository';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { LoginDto } from '../dtos/auth/login.dto';
import { HashService } from '../hash/hash.service';
import { UsersSQLRepository } from '../users/users.repository.sql';
import { IExtendedUser, IUser } from '../types/users';

@Injectable()
export class AuthRepository {
  constructor(
    private emailsRepository: EmailsRepository,
    private usersSqlRepository: UsersSQLRepository,
    private hashService: HashService,
  ) {}

  async verifyUser(data: LoginDto): Promise<IUser | null> {
    const user = await this.usersSqlRepository.getUserByLoginOrEmail(data.loginOrEmail)

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

    return user
  }

  async register(data: CreateUserDto): Promise<IExtendedUser> {
    const user = await this.usersSqlRepository.createUser(data)

    this.emailsRepository.sendRegistrationConfirmationMail(
      user.email,
      user.confirmationCode
    )

    return user
  }

  async confirmEmail(userId: string): Promise<boolean> {
    const confirmedUser = await this.usersSqlRepository.confirmEmailOfUser(userId)

    if (!confirmedUser) {
      return false
    }

    return true
  }

  async getUserByVerificationCode(code: string): Promise<IExtendedUser | null> {
    const user = await this.usersSqlRepository.getUserByVerificationCode(code)

    if (!user) {
      return null
    }

    return user
  }

  async recoveryPassword(email: string): Promise<boolean> {
    const user = await this.usersSqlRepository.getUserByEmail(email)

    if (!user) {
      return false
    }

    await this.usersSqlRepository.setNewConfirmationCodeOfUser(v4(), user.id)

    return await this.emailsRepository.sendRecoveryPasswordMail(
      user.email,
      user.confirmationCode
    )
  }

  async newPassword(
    newPassword: string,
    recoveryCode: string
  ): Promise<boolean> {
    const user =
      await this.usersSqlRepository.getUserByVerificationCode(recoveryCode)
    const { passwordSalt, passwordHash } =
      await this.hashService.generateHash(newPassword)

    if (!user) {
      return false
    }

    await this.usersSqlRepository.setNewHashesOfUser(passwordHash, passwordSalt, user.id)

    return true
  }

  async getMe(userId: string): Promise<any> {
    const user = await this.usersSqlRepository.getById(userId)

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
    const user = await this.usersSqlRepository.getUserByEmail(email)

    if (!user) {
      return null
    }

    if (user.isConfirmed) {
      return null
    }

    const confirmationCode = v4()

    await this.usersSqlRepository.setNewConfirmationCodeOfUser(confirmationCode, user.id)

    return await this.emailsRepository.sendRegistrationConfirmationMail(
      user.email,
      confirmationCode
    )
  }
}
