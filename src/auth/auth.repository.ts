import { FilterQuery, Model, SortOrder } from 'mongoose';
import bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ResponseBody, SortDirections } from '../types/request';
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
    const user = await this.usersRepository.getUserByLoginOrEmail(data.loginOrEmail, data.loginOrEmail)

    if (user) {
      const checkedPassword = await this.checkPassword(data.password, user.passwordHash)

      if (checkedPassword) {
        const accessToken = this.generateAccessToken(data.password)
        const refreshToken = this.generateRefreshToken(data.password)

        return { accessToken, refreshToken }
      } else {
        return null
      }
    } else {
      return null
    }
  }

  async register(data: CreateUserDto): Promise<any | null> {
    const user = await this.usersModel.create(data)
    const { passwordSalt, passwordHash } = await this.generateHash(
      data.password
    )
    user.passwordHash = passwordHash
    user.passwordSalt = passwordSalt
    user.save()

    await this.emailsRepository.sendRegistrationConfirmationMail(
      user.email,
      user.confirmationCode
    )
  }

  private generateAccessToken(password: string): string {
    return this.jwtRepository.generateAcessToken(password)
  }

  private generateRefreshToken(password: string): string {
    return this.jwtRepository.generateRefreshToken(password)
  }

  private async generateHash(
    password: string
  ): Promise<{ passwordSalt: string; passwordHash: string }> {
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, passwordSalt)

    return {
      passwordSalt,
      passwordHash
    }
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
