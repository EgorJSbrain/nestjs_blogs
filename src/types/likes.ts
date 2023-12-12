import { LikeStatusEnum } from "../constants/like"

export interface ILikesInfo {
  sourceId: string
  dislikesCount: number
  likesCount: number
}

export interface ILikeInfo {
  dislikesCount: number
  likesCount: number
  myStatus: LikeStatusEnum
}

export interface ILikeForPost {
  login: string
  userId: string
  addedAt: string
}

export interface IExtendedLikesInfo extends ILikeInfo {
  newestLikes: ILike[]
}

export interface IExtendedLikesForPostInfo extends ILikeInfo {
  newestLikes: ILikeForPost[]
}

export interface ILikeShortType {
  authorId: number
  status: LikeStatusEnum
}

export type LikesRequestParams = {
  sourceId?: string
  authorId?: string
}

export interface ILike {
  id: string
  login: string
  authorId: string
  sourceId: string
  status: LikeStatusEnum
  createdAt: string
}
