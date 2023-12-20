import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid'

import { User, UserDocument } from '../users/users.schema';
import { EmailsRepository } from '../emails/emails.repository';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { JWTService } from '../jwt/jwt.service';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from '../dtos/auth/login.dto';
import { HashService } from '../hash/hash.service';

@Injectable()
export class AuthRepository {
  constructor(
    private emailsRepository: EmailsRepository,
    private JWTService: JWTService,
    private usersRepository: UsersRepository,
    private hashService: HashService,
  ) {}

  async verifyUser(data: LoginDto): Promise<UserDocument | null> {
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

    return user
  }

  // async login(
  //   userId: string,
  //   password: string
  // ): Promise<{ accessToken: string; refreshToken: string } | null> {
  //   const accessToken = this.generateAccessToken(userId, password)
  //   const refreshToken = this.generateRefreshToken(userId, password)

  //   return { accessToken, refreshToken }
  // }

  async register(data: CreateUserDto): Promise<UserDocument> {
    const user = await this.usersRepository.createUser(data)

    this.emailsRepository.sendRegistrationConfirmationMail(
      user.email,
      user.confirmationCode
    )

    return user
  }

  async confirmEmail(code: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByVerificationCode(code)

    if (!user) {
      return false
    }

    if (user && user.isConfirmed) {
      return false
    }

    user.isConfirmed = true
    user.save()

    return true
  }

  async checkIsConfirmedEmail(code: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByVerificationCode(code)

    if (!user) {
      return false
    }

    if (user && user.isConfirmed) {
      return true
    }

    return false
  }

  async recoveryPassword(email: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByEmail(email)

    if (!user) {
      return false
    }

    user.confirmationCode = v4()
    user.save()

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
      await this.usersRepository.getUserByVerificationCode(recoveryCode)
    const { passwordSalt, passwordHash } =
      await this.hashService.generateHash(newPassword)

    if (!user) {
      return false
    }

    user.passwordHash = passwordHash
    user.passwordSalt = passwordSalt
    user.save()

    return true
  }

  // async refreshToken(userId: string, password: string): Promise<any> {
  //   const user = await this.usersRepository.getById(userId)

  //   if (!user) {
  //     return null
  //   }

  //   const checkedPassword = await this.hashService.comparePassword(
  //     password,
  //     user.passwordHash
  //   )

  //   if (!checkedPassword) {
  //     return null
  //   }

  //   const accessToken = this.generateAccessToken(user.id, password)
  //   const refreshToken = this.generateRefreshToken(user.id, password)

  //   return { accessToken: '', refreshToken: '' }
  // }

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

    user.confirmationCode = v4()
    user.save()

    return await this.emailsRepository.sendRegistrationConfirmationMail(
      user.email,
      user.confirmationCode
    )
  }

  // private generateAccessToken(userId: string, password: string): string {
  //   return this.JWTService.generateAcessToken(userId, password)
  // }

  // private generateRefreshToken(userId: string, password: string): string {
  //   return this.JWTService.generateRefreshToken(userId, password)
  // }

  save(user: UserDocument) {
    return user.save()
  }
}
