import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { SortDirectionsEnum } from '../constants/global'
import { CreateUserDto } from '../dtos/users/create-user.dto'
import { HashService } from '../hash/hash.service'
import { IUser, UsersRequestParams } from '../types/users'

@Injectable()
export class UsersSQLRepository {
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
      ORDER BY LOWER("${sortBy}"::text) ${sortDirection.toLocaleUpperCase()}
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

  async getById(id: string) {
    const query = `
      SELECT id, "login", "email", "createdAt"
      FROM public.users
      WHERE id = $1
    `
    const users = await this.dataSource.query(query, [id])
    return users[0]
  }

  async createUser(data: CreateUserDto): Promise<IUser> {
    const { passwordSalt, passwordHash } = await this.hashService.generateHash(
      data.password
    )

    const query = `
      INSERT INTO public.users(
        "login", "email", "passwordHash", "passwordSalt")
        VALUES ($1, $2, $3, $4)
      `

    const selectQuery = `
        SELECT id, "login", "email", "createdAt"
        FROM public.users
        WHERE email = $1
      `

    await this.dataSource.query(query, [
      data.login,
      data.email,
      passwordHash,
      passwordSalt
    ])
    const users = await this.dataSource.query(selectQuery, [data.email])

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
