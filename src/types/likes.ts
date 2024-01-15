import { LikeSourceTypeEnum, LikeStatusEnum } from "../constants/likes"

export interface ILikesInfo {
  sourceId: string
  dislikesCount: number
  likesCount: number
}

export interface ILikeInfo {
  likesCount: number
  dislikesCount: number
  myStatus: LikeStatusEnum
}

export interface ILikeForPost {
  // login: string
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
  sourceType: LikeSourceTypeEnum
  sourceId?: string
  authorId?: string
}

export interface ILike {
  id: string
  authorId: string
  sourceId: string
  status: LikeStatusEnum
  createdAt: string
}
