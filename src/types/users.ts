import { RequestParams } from './request'

export type UsersRequestParams = RequestParams & {
  searchLoginTerm?: string
  searchEmailTerm?: string
}

export interface IUser {
  id: string
  login: string
  email: string
  createdAt: string
}
