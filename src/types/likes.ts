import { LikeSourceTypeEnum, LikeStatusEnum } from "../constants/likes"

export interface IExtendedLikesInfo {
  sourceId: string
  dislikesCount: number
  likesCount: number
}

export interface IExtendedLikeInfo {
  likesCount: number
  dislikesCount: number
  myStatus: LikeStatusEnum
}

export interface IExtendedLikeForPost {
  login: string
  userId: string
  addedAt: string
}

export interface IExtendedLikesInfo extends IExtendedLikeInfo {
  newestLikes: IExtendedLike[]
}

export interface IExtendedLikesForPostInfo extends IExtendedLikeInfo {
  newestLikes: IExtendedLikeForPost[]
}

export interface IExtendedLikeShortType {
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

export interface IExtendedLike extends ILike {
  login: string
}
