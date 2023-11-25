import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ResponseBody, SortDirections } from '../types/request';
import { User, UserDocument } from 'src/users/users.schema';
import { EmailsRepository } from 'src/emails/emails.repository';
import { CreateUserDto } from 'src/dtos/users/create-user.dto';
import { JwtRepository } from 'src/jwt/jwt.repository';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    private emailsRepository: EmailsRepository,
    private jwtRepository: JwtRepository,
    private usersRepository: UsersRepository,
  ) {}

  async login(): Promise<any | null> {}

  async register(data: CreateUserDto): Promise<any | null> {
    // const user = await this.usersModel.create(data)
    const user = await this.usersRepository.createUser(data)
    console.log("!!!!!!register ~ user:", user)

    await this.emailsRepository.sendRegistrationConfirmationMail(
      user.email,
      user.confirmationCode
    )
  }

  private generateAccess(password: string): string {
    return this.jwtRepository.generateAcessToken(password)
  }

  private generateRefreshToken(password: string): string {
    return this.jwtRepository.generateRefreshToken(password)
  }

  save(user: UserDocument) {
    return user.save()
  }
}
