import { IExtendedLikeForPost, IExtendedLike } from '../types/likes'

export const formatLikes = (likes: IExtendedLike[]): IExtendedLikeForPost[] =>
  likes.map((newestLike) => ({
    addedAt: newestLike.createdAt,
    userId: newestLike.authorId,
    login: newestLike.login
  }))
