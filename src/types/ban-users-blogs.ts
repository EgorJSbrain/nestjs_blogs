export interface IBanUsersBlogs {
  id: string
  blogId: string
  userId: string
  banReason: string | null
  isBanned: boolean
  banDate: string | null
}
