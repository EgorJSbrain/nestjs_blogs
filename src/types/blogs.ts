import { RequestParams } from './request'

export type BlogsRequestParams = RequestParams & {
  searchNameTerm?: string
}

export interface IBlog {
  id: string
  name: string
  description: string
  websiteUrl: string
  isMembership: boolean
  createdAt: string
}
