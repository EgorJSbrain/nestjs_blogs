import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ResponseBody, SortDirections } from '../types/request';
import { User, UserDocument } from 'src/users/users.schema';
import { EmailsRepository } from 'src/emails/emails.repository';
import { CreateUserDto } from 'src/dtos/users/create-user.dto';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    private emailsRepository: EmailsRepository
  ) {}

  async login(): Promise<any | null> {
    
  }

  async register(data: CreateUserDto): Promise<any | null> {
    const user = await this.usersModel.create(data)
    console.log("🚀 ~ file: auth.repository.ts:23 ~ AuthRepository ~ register ~ user:", user)

    await this.emailsRepository.sendRegistrationConfirmationMail(user)
  }


  save(user: UserDocument) {
    return user.save()
  }
}
