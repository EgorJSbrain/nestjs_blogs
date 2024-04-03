import { Images } from './files'
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
  isBanned?: boolean
  createdAt: string
  banDate?: string | null
}

type BlogOwnerInfo = {
  userId: string,
  userLogin: string
}

type BanBlogInfo = {
  isBanned: boolean,
  banDate: string
}

export interface IBlogForSA {
  id: string
  name: string
  description: string
  websiteUrl: string
  isMembership: boolean
  createdAt: string
  blogOwnerInfo: BlogOwnerInfo
  banInfo: BanBlogInfo
}

export interface IBlogForSA {
  id: string
  name: string
  description: string
  websiteUrl: string
  isMembership: boolean
  createdAt: string
  blogOwnerInfo: BlogOwnerInfo
  banInfo: BanBlogInfo
}

export type CreatingBlogData = {
  name: string
  description: string
  websiteUrl: string
  ownerId?: string
}



export interface IBlogWithImages extends IBlog {
  images: Images
}
