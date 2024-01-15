import { ILikeInfo } from './likes'

export type CommentAuthorInfo = {
  userId: string
  userLogin: string
}

export interface ICreatedComment {
  id: string
  authorId: string
  content: string
  createdAt: string
  likesInfo: ILikeInfo
}

export interface IComment {
  id: string
  commentatorInfo: CommentAuthorInfo
  content: string
  createdAt: string
  likesInfo: ILikeInfo
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
