import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ResponseBody, SortDirections } from '../types/request';
import { User, UserDocument } from 'src/users/users.schema';

@Injectable()
export class ConfigurationRepository {
  constructor() {}

  async getSMTP(): Promise<string> {
    return process.env.SMTP_USER ?? ''
  }
}
