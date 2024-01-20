import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, Repository } from 'typeorm'
import { v4 } from 'uuid'

import { SortDirections, SortDirectionsEnum } from '../constants/global'
import { CreateUserDto } from '../dtos/users/create-user.dto'
import { HashService } from '../hash/hash.service'
import { IExtendedUser, IUser, UsersRequestParams } from '../types/users'
import { UserEntity } from '../entities/user'

const writeSql = async (sql: string) => {
  const fs = require('fs/promises')
  try {
    await fs.writeFile('sql.txt', sql)
  } catch (err) {
  console. log (err)
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
    const skip = ((pageNumberNum || 1) - 1) * pageSizeNumber

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

    console.log("----whereFilter:", whereFilter)
    console.log("----!!!-----:", `user.${sortBy}`, sortDirection)

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
      .select([
        'user.id',
        'user.login',
        'user.email',
        'user.createdAt',
      ])
      .orderBy(`user.${sortBy}`, sortDirection)
      .addOrderBy(`user.${sortBy}`)
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
    const query = `
      SELECT "createdAt", login, email, id, "passwordHash"
      FROM public.users
      WHERE "email" = $1 OR
        "login" = $1
    `
    const users = await this.dataSource.query<IExtendedUser[]>(query, [
      loginOrEmail
    ])

    if (!users[0]) {
      return null
    }

    return users[0]
  }

  async getUserByEmail(email: string): Promise<IExtendedUser | null> {
    const query = `
      SELECT "createdAt", login, email, id, "passwordHash", "isConfirmed"
      FROM public.users
      WHERE "email" = $1
    `
    const users = await this.dataSource.query<IExtendedUser[]>(query, [email])

    if (!users[0]) {
      return null
    }

    return users[0]
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
    const query = `
      SELECT "createdAt", login, email, id, "passwordHash", "isConfirmed"
      FROM public.users
      WHERE "confirmationCode" = $1
    `
    const users = await this.dataSource.query<IExtendedUser[]>(query, [code])

    if (!users[0]) {
      return null
    }

    return users[0]
  }

  async confirmEmailOfUser(id: string): Promise<IExtendedUser | null> {
    const query = `
      UPDATE public.users
        SET "isConfirmed"=true
        WHERE id = $1;
      `
    const users = await this.dataSource.query<IExtendedUser[]>(query, [id])

    if (!users[0]) {
      return null
    }

    return users[0]
  }

  async setNewConfirmationCodeOfUser(
    code: string,
    id: string
  ): Promise<IExtendedUser | null> {
    const query = `
      UPDATE public.users
      SET "confirmationCode"=$1
      WHERE id = $2
    `
    const users = await this.dataSource.query<IExtendedUser[]>(query, [
      code,
      id
    ])

    if (!users[0]) {
      return null
    }

    return users[0]
  }
  async setNewHashesOfUser(
    passwordHash: string,
    passwordSalt: string,
    id: string
  ): Promise<IExtendedUser | null> {
    const query = `
      UPDATE public.users
      SET "passwordHash"=$1, "passwordSalt"=$2
      WHERE id = $3
    `
    const users = await this.dataSource.query<IExtendedUser[]>(query, [
      passwordHash,
      passwordSalt,
      id
    ])

    if (!users[0]) {
      return null
    }

    return users[0]
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
