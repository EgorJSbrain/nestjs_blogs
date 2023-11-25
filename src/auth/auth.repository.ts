import { FilterQuery, Model, SortOrder } from 'mongoose';
import bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ResponseBody, SortDirections } from '../types/request';
import { User, UserDocument } from 'src/users/users.schema';
import { EmailsRepository } from 'src/emails/emails.repository';
import { CreateUserDto } from 'src/dtos/users/create-user.dto';
import { JwtRepository } from 'src/jwt/jwt.repository';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    private emailsRepository: EmailsRepository,
    private jwtRepository: JwtRepository
  ) {}

  async login(): Promise<any | null> {}

  async register(data: CreateUserDto): Promise<any | null> {
    const user = await this.usersModel.create(data)
    const { passwordSalt, passwordHash } = await this.generateHash(
      data.password
    )
    user.passwordHash = passwordHash
    user.passwordSalt = passwordSalt
    user.save()

    await this.emailsRepository.sendRegistrationConfirmationMail(user)
  }

  private generateAccess(password: string): string {
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

  save(user: UserDocument) {
    return user.save()
  }
}
