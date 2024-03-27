import { RequestParams } from './request'
import { UserBanStatusEnum } from '../enums/UserBanStatusEnum'

export type UsersRequestParams = RequestParams & {
  searchLoginTerm?: string
  searchEmailTerm?: string
  banStatus?: UserBanStatusEnum
}

export type UserBanData = {
  isBanned: boolean
  banReason: string
}

export interface IUser {
  id: string
  login: string
  email: string
  createdAt: string
  banInfo?: UserBanInfo
}

export interface IExtendedUser extends IUser {
  passwordHash: string
  isConfirmed: boolean
  confirmationCode: string
  isBanned: boolean
  banReason: string | null
  banDate: string | null
}

export type UserBanInfo = {
  isBanned: boolean
  banReason: string | null
  banDate: string | null
}
