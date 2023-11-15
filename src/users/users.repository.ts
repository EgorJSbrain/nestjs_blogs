import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User } from './users.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private usersModel: Model<User>) {}

  getAll() {
    return this.usersModel.find().exec()
  }

  getById(id: string) {
    return this.usersModel.findById(id)
  }
}
