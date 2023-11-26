import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt'

import { User, UserDocument } from './users.schema';
import { CreateUserDto } from 'src/dtos/users/create-user.dto';
import { ResponseBody, SortDirections } from '../types/request';
import { UsersRequestParams } from '../types/users';
import { IUser } from './types/user';

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

  async getById(id: string): Promise<UserDocument | null> {
    const user = await this.usersModel.findOne({ id })

    if (!user) {
      return null
    }

    return user
  }

  async getUserByLoginOrEmail(email: string, login: string): Promise<UserDocument | null> {
    try {
      const user = await this.usersModel.findOne(
        { $or: [{ email }, { login }] },
        { projection: { _id: 0 } }
      )

      return user
    } catch {
      return null
    }
  }

  async createUser(data: CreateUserDto): Promise<UserDocument> {
    const newUser = new this.usersModel(data)
    newUser.setDateOfCreatedAt()
    newUser.setId()
    newUser.setConfirmationCode()
    newUser.setExpirationDate()
    const { passwordSalt, passwordHash } = await this.generateHash(
      data.password
    )
    newUser.passwordHash = passwordHash
    newUser.passwordSalt = passwordSalt

    const createdUser = await newUser.save()

    return createdUser
  }

  deleteUser(id: string) {
    return this.usersModel.deleteOne({ id })
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
