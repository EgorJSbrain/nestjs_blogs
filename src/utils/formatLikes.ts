import { ILikeForPost, ILike } from '../types/likes'

export const formatLikes = (likes: ILike[]): ILikeForPost[] =>
  likes.map((newestLike) => ({
    addedAt: newestLike.createdAt,
    userId: newestLike.authorId,
    login: newestLike.login
  }))
