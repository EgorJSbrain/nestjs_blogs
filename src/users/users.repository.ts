import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from './users.schema';
import { CreateUserDto } from 'src/dtos/users/create-user.dto';
import { RequestParams, ResponseBody, SortDirections } from 'src/types/request';
import { UsersRequestParams } from 'src/types/users';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private usersModel: Model<UserDocument>) {}

  async getAll(params: UsersRequestParams): Promise<ResponseBody<UserDocument> | []>  {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10,
        searchLoginTerm,
        searchEmailTerm
      } = params
  
      const sort: Record<string, SortOrder> = {}
      let filter: FilterQuery<UserDocument> = {}
  
      if (searchLoginTerm) {
        filter = {
          $or: [
            { login: { $regex: searchLoginTerm, $options: 'i' } }
          ]
        }
      }
  
      if (searchEmailTerm) {
        filter = {
          $or: [...(filter.$or || []), { email: { $regex: searchEmailTerm, $options: 'i' } }]
        }
      }
  
      if (sortBy && sortDirection) {
        sort[sortBy] = sortDirection === SortDirections.asc ? 1 : -1
      }
  
      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber
      const count = await this.usersModel.countDocuments(filter)
      const pagesCount = Math.ceil(count / pageSizeNumber)
  
      const users = await this.usersModel
        .find(filter, { _id: 0, __v: 0 })
        .skip(skip)
        .limit(pageSizeNumber)
        .sort(sort)
        .exec()
      
      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: users
      }
    } catch {
      return []
    }
  }

  getById(id: string) {
    return this.usersModel.findById(id)
  }

  createUser(data: CreateUserDto) {
    const newUser = new this.usersModel(data)
    newUser.setDateOfCreatedAt()
    newUser.setId()

    return newUser.save()
  }

  deleteUser(id: string) {
    return this.usersModel.deleteOne({ id })
  }

  save(user: UserDocument) {
    return user.save()
  }
}
