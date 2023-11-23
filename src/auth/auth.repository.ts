import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ResponseBody, SortDirections } from '../types/request';
import { User, UserDocument } from 'src/users/users.schema';

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(User.name) private usersModel: Model<UserDocument>) {}

  async login(): Promise<any | null> {
    
  }


  save(user: UserDocument) {
    return user.save()
  }
}
