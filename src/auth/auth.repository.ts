import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt'
import { v4 } from 'uuid'

import { User, UserDocument } from 'src/users/users.schema';
import { EmailsRepository } from 'src/emails/emails.repository';
import { CreateUserDto } from 'src/dtos/users/create-user.dto';
import { JwtRepository } from 'src/jwt/jwt.repository';
import { UsersRepository } from 'src/users/users.repository';
import { LoginDto } from 'src/dtos/auth/login.dto';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    private emailsRepository: EmailsRepository,
    private jwtRepository: JwtRepository,
    private usersRepository: UsersRepository
  ) {}

  async login(data: LoginDto): Promise<{ accessToken: string, refreshToken: string } | null> {
    const user = await this.usersRepository.getUserByLoginOrEmail(
      data.loginOrEmail,
      data.loginOrEmail
    )

    if (user) {
      const checkedPassword = await this.checkPassword(data.password, user.passwordHash)

      if (checkedPassword) {
        const accessToken = this.generateAccessToken(user.id, data.password)
        const refreshToken = this.generateRefreshToken(user.id, data.password)

        return { accessToken, refreshToken }
      } else {
        return null
      }
    } else {
      return null
    }
  }

  async register(data: CreateUserDto): Promise<any | null> {
    const user = await this.usersRepository.createUser(data)

    await this.emailsRepository.sendRegistrationConfirmationMail(
      user.email,
      user.confirmationCode
    )
  }

  async confirmEmail(code: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByVerificationCode(code)

    if (!user || user?.isConfirmed) {
      return false
    }

    user.isConfirmed = true
    user.save()

    return true
  }

  async recoveryPassword(email: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByEmail(email)

    if (!user) {
      return false
    }

    user.confirmationCode = v4()
    user.save()

    await this.emailsRepository.sendRecoveryPasswordMail(user.email, user.confirmationCode)

    return true
  }

  async newPassword(newPassword: string, recoveryCode: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByVerificationCode(recoveryCode)
    const { passwordSalt, passwordHash } = await this.usersRepository.generateHash(newPassword)

    if (!user) {
      return false
    }

    user.passwordHash = passwordHash
    user.passwordSalt = passwordSalt
    user.save()

    return true
  }

  private generateAccessToken(userId: string, password: string): string {
    return this.jwtRepository.generateAcessToken(userId, password)
  }

  private generateRefreshToken(userId: string, password: string): string {
    return this.jwtRepository.generateRefreshToken(userId, password)
  }

  private async checkPassword(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    const passwordChecked = await bcrypt.compare(password, passwordHash)

    if (passwordChecked) {
      return true
    } else {
      return false
    }
  }

  save(user: UserDocument) {
    return user.save()
  }
}
