import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from './users.schema';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { ResponseBody } from '../types/request';
import { UsersRequestParams } from '../types/users';
import { HashService } from '../hash/hash.service';
import { SortDirectionsEnum } from 'src/constants/global';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    private hashService: HashService
  ) {}

  async getAll(params: UsersRequestParams): Promise<ResponseBody<UserDocument> | null>  {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirectionsEnum.desc,
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
        sort[sortBy] = sortDirection === SortDirectionsEnum.asc ? 1 : -1
      }

      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber
      const count = await this.usersModel.countDocuments(filter)
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const users = await this.usersModel
        .find(filter, {
          _id: 0,
          __v: 0,
          confirmationCode: 0,
          expirationDate: 0,
          passwordHash: 0,
          passwordSalt: 0,
          isConfirmed: 0,
        })
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
      return null
    }
  }

  async getById(id: string): Promise<UserDocument | null> {
    const user = await this.usersModel.findOne({ id })

    if (!user) {
      return null
    }

    return user
  }

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    try {
      const user = await this.usersModel.findOne(
        { $or: [{ email: loginOrEmail }, { login: loginOrEmail }] },
        { projection: { _id: 0 } }
      )

      return user
    } catch {
      return null
    }
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    try {
      const user =  await this.usersModel.findOne(
        { email },
        { projection: { _id: 0 } }
      )

      return user
    } catch {
      return null
    }
  }

  async getUserByVerificationCode(code: string): Promise<UserDocument | null> {
    try {
      const user = await this.usersModel.findOne(
        { confirmationCode: code },
        {
          projection: {
            _id: 0,
            passwordHash: 0,
            passwordSolt: 0
          }
        }
      )

      return user
    } catch {
      return null
    }
  }

  async createUser(data: CreateUserDto, isConfirmed?: boolean): Promise<UserDocument> {
    const newUser = new this.usersModel(data)
    newUser.setDateOfCreatedAt()
    newUser.setId()
    newUser.setConfirmationCode()
    newUser.setExpirationDate()
    const { passwordSalt, passwordHash } = await this.hashService.generateHash(
      data.password
    )
    newUser.passwordHash = passwordHash
    newUser.passwordSalt = passwordSalt
    newUser.isConfirmed = !!isConfirmed

    const createdUser = await newUser.save()

    return createdUser
  }

  deleteUser(id: string) {
    return this.usersModel.deleteOne({ id })
  }

  save(user: UserDocument) {
    return user.save()
  }
}
