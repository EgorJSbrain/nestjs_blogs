import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository, UpdateResult } from 'typeorm'
import { v4 } from 'uuid'

import { SortDirections, SortType } from '../constants/global'
import { CreateUserDto } from '../dtos/users/create-user.dto'
import { HashService } from '../hash/hash.service'
import {
  BloggerUsersRequestParams,
  IExtendedUser,
  UserBanData,
  UsersRequestParams
} from '../types/users'
import { UserEntity } from '../entities/user'
import { UserBanStatusEnum } from '../enums/UserBanStatusEnum'
import { BanUsersBlogsEntity } from '../entities/ban-users-blogs'

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,

    @InjectRepository(BanUsersBlogsEntity)
    private readonly banUserBlogRepo: Repository<BanUsersBlogsEntity>,

    private hashService: HashService
  ) {}

  async getAll(params: UsersRequestParams) {
    const {
      sortBy = 'createdAt',
      sortDirection = SortDirections.desc,
      pageNumber = 1,
      pageSize = 10,
      searchLoginTerm = '',
      searchEmailTerm = '',
      banStatus = UserBanStatusEnum.all
    } = params

    const pageSizeNumber = Number(pageSize)
    const pageNumberNum = Number(pageNumber)
    const skip = (pageNumberNum - 1) * pageSizeNumber

    let whereFilter = ''

    if (banStatus !== UserBanStatusEnum.all) {
      whereFilter = 'user.isBanned = :isBanned'
    }

    if (searchEmailTerm && !searchLoginTerm) {
      whereFilter = `${whereFilter ? whereFilter + ' AND ' : ''} user.email ILIKE :email`
    }

    if (searchLoginTerm && !searchEmailTerm) {
      whereFilter = `${whereFilter ? whereFilter + ' AND ' : ''} user.login ILIKE :login`
    }

    if (searchLoginTerm && searchEmailTerm) {
      whereFilter = `${whereFilter ? whereFilter + ' AND ' : ''} user.email ILIKE :email OR user.login ILIKE :login`
    }

    const query = this.usersRepo.createQueryBuilder('user')

    const searchObject = query
      .where(whereFilter, {
        email: searchEmailTerm
          ? `%${searchEmailTerm.toLocaleLowerCase()}%`
          : undefined,
        login: searchLoginTerm
          ? `%${searchLoginTerm.toLocaleLowerCase()}%`
          : undefined,
        isBanned: banStatus === UserBanStatusEnum.all ? undefined : banStatus === UserBanStatusEnum.banned ? true : false
      })
      .select()
      .addOrderBy(
        `user.${sortBy}`,
        sortDirection?.toLocaleUpperCase() as SortType
      )
      .skip(skip)
      .take(pageSizeNumber)

    const users = await searchObject.take(pageSizeNumber).getMany()
    const count = await searchObject.getCount()
    const pagesCount = Math.ceil(count / pageSizeNumber)

    const preparedUsers = users.map(user => ({
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    }))

    return {
      pagesCount,
      page: pageNumberNum || 1,
      pageSize: pageSizeNumber,
      totalCount: count,
      items: preparedUsers
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
      .select('user')
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

  async banUnbanUser(
    userId: string,
    data: UserBanData,
    manager: EntityManager
  ): Promise<UpdateResult | null> {
    try {
      const { isBanned, banReason } = data
      const banDate = isBanned ? new Date().toISOString() : null
      const banReasonText = isBanned && banReason ? banReason : null

      return await manager.update<UserEntity>(
        UserEntity,
        {
          id: userId
        },
        { banReason: banReasonText, isBanned, banDate }
      )
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async updateBanUserForBlog(
    userId: string,
    blogId: string,
    data: UserBanData,
    manager: EntityManager
  ): Promise<UpdateResult | null> {
    try {
      const { isBanned, banReason } = data
      const banReasonText = isBanned && banReason ? banReason : null
      const banDate = isBanned ? new Date().toISOString() : null

      return await manager.update(
        BanUsersBlogsEntity,
        {
          userId,
          blogId,
        },
        { banReason: banReasonText, isBanned, banDate }
      )
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async createBanUserForBlog(
    userId: string,
    blogId: string,
    data: UserBanData,
    manager: EntityManager
  ): Promise<BanUsersBlogsEntity | null> {
    try {
      const { isBanned, banReason } = data
      const bannedUser = BanUsersBlogsEntity.create()
      const banDate = isBanned ? new Date().toISOString() : null

      bannedUser.banReason = banReason
      bannedUser.userId = userId
      bannedUser.blogId = blogId
      bannedUser.isBanned = isBanned
      bannedUser.banDate = banDate

      return await manager.save(bannedUser)
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async checkBanOfUserForBlog(
    userId: string,
    blogId: string,
  ): Promise<BanUsersBlogsEntity | null> {
    try {
      const bannedUserForBlog = await this.banUserBlogRepo.findOne({
        where: {
          userId,
          blogId
        }
      })

      if (!bannedUserForBlog) {
        return null
      }

      return bannedUserForBlog
    } catch (e) {
      throw new Error(e.message)
    }
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
    try {
      const user = await this.usersRepo
        .createQueryBuilder('user')
        .delete()
        .where('id = :id', { id })
        .execute()

      return !!user.affected
    } catch (e) {
      return false
    }
  }


  async getBannedUsersForBlog(blogId: string, params: BloggerUsersRequestParams) {
    const {
      sortBy = 'createdAt',
      sortDirection = SortDirections.desc,
      pageNumber = 1,
      pageSize = 10,
      searchLoginTerm = '',
    } = params

    const pageSizeNumber = Number(pageSize)
    const pageNumberNum = Number(pageNumber)
    const skip = (pageNumberNum - 1) * pageSizeNumber

    let whereFilter = 'ban.blogId = :blogId AND ban.isBanned = true'

    if (searchLoginTerm) {
      whereFilter = `${whereFilter + ' AND '} user.login ILIKE :login`
    }

    const query = this.banUserBlogRepo.createQueryBuilder('ban')

    const searchObject = query
      .where(whereFilter, {
        blogId,
        login: searchLoginTerm
          ? `%${searchLoginTerm.toLocaleLowerCase()}%`
          : undefined,
      })
      .select([
        'ban.*',
        'ban.createdAt as createdat'
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('user.login', 'login')
          .from(UserEntity, 'user')
          .where('ban.userId = user.id')
      }, 'login')
      .addOrderBy(
        sortBy,
        sortDirection?.toLocaleUpperCase() as SortType
      )
      .skip(skip)
      .take(pageSizeNumber)

    const bans = await searchObject.getRawMany()
    const count = await searchObject.getCount()
    const pagesCount = Math.ceil(count / pageSizeNumber)

    const preparedBannedUsers = bans.map(ban => ({
      id: ban.userId,
      login: ban.login,
      banInfo: {
        isBanned: ban.isBanned,
        banReason: ban.banReason,
        banDate: ban.banDate,
      },
    }))

    return {
      pagesCount,
      page: pageNumberNum || 1,
      pageSize: pageSizeNumber,
      totalCount: count,
      items: preparedBannedUsers
    }
  }

  async checkBanUserForBlog(userId: string, blogId: string) {
    return await this.banUserBlogRepo
      .createQueryBuilder('ban')
      .select()
      .where('ban.userId = :userId AND ban.blogId = :blogId', { userId, blogId })
      .getOne()
  }
}
