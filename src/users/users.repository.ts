import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { v4 } from 'uuid'

import { SortDirectionsEnum } from '../constants/global'
import { CreateUserDto } from '../dtos/users/create-user.dto'
import { HashService } from '../hash/hash.service'
import { IExtendedUser, IUser, UsersRequestParams } from '../types/users'

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private hashService: HashService
  ) {}

  async getAll(params: UsersRequestParams) {
    const {
      sortBy = 'createdAt',
      sortDirection = SortDirectionsEnum.desc,
      pageNumber = 1,
      pageSize = 10,
      searchLoginTerm = '',
      searchEmailTerm = ''
    } = params

    const pageSizeNumber = Number(pageSize)
    const pageNumberNum = Number(pageNumber)
    const skip = (pageNumberNum - 1) * pageSizeNumber

    const query = `
      SELECT "createdAt", login, email, id
      FROM public.users
      WHERE "email" ILIKE $1 OR
        "login" ILIKE $2
      ORDER BY "${sortBy}" ${sortDirection.toLocaleUpperCase()}
      LIMIT $3 OFFSET $4
    `
    const users = await this.dataSource.query(query, [
      `%${searchEmailTerm}%`,
      `%${searchLoginTerm}%`,
      pageSizeNumber,
      skip
    ])

    const queryForCount = `
      SELECT count(*) AS count FROM public.users
      WHERE "email" ILIKE $1 OR
        "login" ILIKE $2
    `
    const countResult = await this.dataSource.query(queryForCount, [
      `%${searchEmailTerm}%`,
      `%${searchLoginTerm}%`
    ])

    const count = countResult[0] ? Number(countResult[0].count) : 0
    const pagesCount = Math.ceil(count / pageSizeNumber)

    return {
      pagesCount,
      page: pageNumberNum,
      pageSize: pageSizeNumber,
      totalCount: count,
      items: users
    }
  }

  async getById(id: string): Promise<IUser | null> {
    const query = `
      SELECT id, "login", "email", "createdAt", "isConfirmed"
      FROM public.users
      WHERE id = $1
    `
    const users = await this.dataSource.query<IUser[]>(query, [id])

    if (!users[0]) {
      return null
    }

    return users[0]
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
    const users = await this.dataSource.query<IExtendedUser[]>(query, [loginOrEmail])

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

  async createUser(data: CreateUserDto): Promise<IExtendedUser> {
    const { passwordSalt, passwordHash } = await this.hashService.generateHash(
      data.password
    )

    const confirmationCode = v4()

    const query = `
      INSERT INTO public.users(
        "login", "email", "passwordHash", "passwordSalt", "confirmationCode"
      )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, "login", "email", "createdAt", "confirmationCode"
      `

    const users = await this.dataSource.query(query, [
      data.login,
      data.email,
      passwordHash,
      passwordSalt,
      confirmationCode
    ])

    return users[0]
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

  async setNewConfirmationCodeOfUser(code: string, id: string): Promise<IExtendedUser | null> {
    const query = `
      UPDATE public.users
      SET "confirmationCode"=$1
      WHERE id = $2
    `
    const users = await this.dataSource.query<IExtendedUser[]>(query, [code, id])

    if (!users[0]) {
      return null
    }

    return users[0]
  }
  async setNewHashesOfUser(passwordHash: string, passwordSalt: string, id: string): Promise<IExtendedUser | null> {
    const query = `
      UPDATE public.users
      SET "passwordHash"=$1, "passwordSalt"=$2
      WHERE id = $3
    `
    const users = await this.dataSource.query<IExtendedUser[]>(query, [passwordHash, passwordSalt, id])

    if (!users[0]) {
      return null
    }

    return users[0]
  }

  deleteById(id: string) {
    const query = `
      DELETE FROM public.users
      WHERE id = $1
    `
    return this.dataSource.query(query, [id])
  }
}
