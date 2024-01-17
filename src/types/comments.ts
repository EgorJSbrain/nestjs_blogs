import { IExtendedLikeInfo } from './likes'

export type CommentAuthorInfo = {
  userId: string
  userLogin: string
}

export interface ICreatedComment {
  id: string
  authorId: string
  content: string
  createdAt: string
  likesInfo: IExtendedLikeInfo
}

export interface IComment {
  id: string
  content: string
  sourceId: string
  authorId: string
  createdAt: string
}

export interface IExtendedComment {
  id: string
  commentatorInfo: CommentAuthorInfo
  content: string
  createdAt: string
  likesInfo: IExtendedLikeInfo
}

export interface ICreateCommentType {
  readonly content: string
  readonly userId: string
  readonly sourceId: string
}

export interface IUpdateCommentType {
  readonly id: string
  readonly content: string
}
