export interface IPost {
  id: string
  blogId: string
  title: string
  content: string
  shortDescription: string
  createdAt: string
}

export interface IExtendedPost extends IPost{
  blogName: string
  extendedLikesInfo?: any
}

export interface ICreatePostType {
  readonly title: string
  readonly content: string
  readonly shortDescription: string
  readonly blogId?: string
}
