import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { v4 } from 'uuid'

import { SortDirections, SortType } from '../constants/global'
import { CreateUserDto } from '../dtos/users/create-user.dto'
import { HashService } from '../hash/hash.service'
import { IExtendedUser, UsersRequestParams } from '../types/users'
import { UserEntity } from '../entities/user'

const writeSql = async (sql: string) => {
  const fs = require('fs/promises')
  try {
    await fs.writeFile('sql.txt', sql)
  } catch (err) {
    console.log(err)
  }
}

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,

    private hashService: HashService
  ) {}

  async getAll(params: UsersRequestParams) {
    const {
      sortBy = 'createdAt',
      sortDirection = SortDirections.desc,
      pageNumber = 1,
      pageSize = 10,
      searchLoginTerm = '',
      searchEmailTerm = ''
    } = params

    const pageSizeNumber = Number(pageSize)
    const pageNumberNum = Number(pageNumber)
    const skip = (pageNumberNum - 1) * pageSizeNumber

    let whereFilter = ''

    if (searchEmailTerm) {
      whereFilter = 'user.email ILIKE :email'
    }

    if (searchLoginTerm) {
      whereFilter = 'user.login ILIKE :login'
    }

    if (searchLoginTerm && searchEmailTerm) {
      whereFilter = 'user.email ILIKE :email OR user.login ILIKE :login'
    }

    const query = this.usersRepo.createQueryBuilder('user')
    const searchObject = query
      .where(whereFilter, {
        email: searchEmailTerm
          ? `%${searchEmailTerm.toLocaleLowerCase()}%`
          : undefined,
        login: searchLoginTerm
          ? `%${searchLoginTerm.toLocaleLowerCase()}%`
          : undefined
      })
      .select(['user.id', 'user.login', 'user.email', 'user.createdAt'])
      .addOrderBy(
        `user.${sortBy}`,
        sortDirection?.toLocaleUpperCase() as SortType
      )
      .skip(skip)
      .take(pageSizeNumber)

    const users = await searchObject.take(pageSizeNumber).getMany()
    const count = await searchObject.getCount()

    const pagesCount = Math.ceil(count / pageSizeNumber)

    return {
      pagesCount,
      page: pageNumberNum || 1,
      pageSize: pageSizeNumber,
      totalCount: count,
      items: users
    }
  }

  async getById(id: string): Promise<UserEntity | null> {
    const user = this.usersRepo
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne()

    if (!user) {
      return null
    }

    return user
  }

  async getUserByLoginOrEmail(
    loginOrEmail: string
  ): Promise<IExtendedUser | null> {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.login = :login OR user.email = :email', {
        login: loginOrEmail,
        email: loginOrEmail
      })
      .getOne()

    if (!user) {
      return null
    }

    return user
  }

  async getUserByEmail(email: string): Promise<IExtendedUser | null> {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .select([
        'user.createdAt',
        'user.login',
        'user.email',
        'user.id',
        'user.passwordHash',
        'user.isConfirmed'
      ])
      .where('user.email = :email', {
        email: email
      })
      .getOne()

    if (!user) {
      return null
    }

    return user
  }

  async createUser(data: CreateUserDto): Promise<UserEntity | null> {
    const { passwordSalt, passwordHash } = await this.hashService.generateHash(
      data.password
    )

    const confirmationCode = v4()

    const query = this.usersRepo.createQueryBuilder('user')

    const newUser = await query
      .insert()
      .values({
        login: data.login,
        email: data.email,
        passwordHash,
        passwordSalt,
        confirmationCode
      })
      .execute()

    const user = await query
      .select([
        'user.id',
        'user.login',
        'user.email',
        'user.createdAt',
        'user.confirmationCode'
      ])
      .where('user.id = :id', { id: newUser.raw[0].id })
      .getOne()

    if (!user) {
      return null
    }

    return user
  }

  async getUserByVerificationCode(code: string): Promise<IExtendedUser | null> {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .select([
        'user.createdAt',
        'user.login',
        'user.email',
        'user.id',
        'user.passwordHash',
        'user.isConfirmed'
      ])
      .where('user.confirmationCode = :confirmationCode', {
        confirmationCode: code
      })
      .getOne()

    if (!user) {
      return null
    }

    return user
  }

  async confirmEmailOfUser(id: string): Promise<any | null> {
    await this.usersRepo
      .createQueryBuilder('user')
      .update()
      .set({ isConfirmed: true })
      .where('id = :id', {
        id
      })
      .execute()

    const user = await this.getById(id)

    if (!user) {
      return null
    }

    return user
  }

  async setNewConfirmationCodeOfUser(
    code: string,
    id: string
  ): Promise<IExtendedUser | null> {
    await this.usersRepo
      .createQueryBuilder('user')
      .update()
      .set({ confirmationCode: code })
      .where('id = :id', {
        id
      })
      .execute()

    const user = await this.getById(id)

    if (!user) {
      return null
    }

    return user
  }

  async setNewHashesOfUser(
    passwordHash: string,
    passwordSalt: string,
    id: string
  ): Promise<IExtendedUser | null> {
    await this.usersRepo
      .createQueryBuilder('user')
      .update()
      .set({ passwordHash, passwordSalt })
      .where('id = :id', {
        id
      })
      .execute()

    const user = await this.getById(id)

    if (!user) {
      return null
    }

    return user
  }

  async deleteById(id: string) {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .delete()
      .where('id = :id', { id })
      .execute()

    return !!user.affected
  }
}
