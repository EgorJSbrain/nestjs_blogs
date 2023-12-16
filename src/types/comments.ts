import { ILikeInfo } from './likes'

export type CommentUserInfo = {
  userId: string
  userLogin: string
}

export interface IComment {
  id: string
  commentatorInfo: CommentUserInfo
  content: string
  createdAt: string
  likesInfo: ILikeInfo
}

export interface ICreateCommentType {
  readonly content: string
  readonly authorInfo: CommentUserInfo
  readonly sourceId: string
}
