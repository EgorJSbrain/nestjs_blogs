export interface IPost {
  id: string
  blogId: string
  title: string
  content: string
  shortDescription: string
  blogName: string
  createdAt: string
  extendedLikesInfo?: any
}

export interface CreatePostType {
  readonly title: string
  readonly content: string
  readonly shortDescription: string
  readonly blogId?: string
  readonly blogName?: string
}
