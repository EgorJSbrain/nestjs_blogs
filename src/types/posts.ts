import { Image } from './files'
import { IExtendedLikesForPostInfo } from './likes'

export interface IPost {
  id: string
  blogId: string
  title: string
  content: string
  shortDescription: string
  createdAt: string
}

export interface IExtendedPost extends IPost {
  blogName: string
  extendedLikesInfo?: IExtendedLikesForPostInfo
  images?: {
    main: Image[]
  }
}

export interface ICreatePostType {
  readonly title: string
  readonly content: string
  readonly shortDescription: string
  readonly blogId?: string
}
