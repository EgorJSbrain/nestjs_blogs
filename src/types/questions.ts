import { RequestParams } from './request'

export type QuestionsRequestParams = RequestParams & {
  bodySearchTerm?: string
}

export interface IQuestion {
  id: string
  body: string
  correctAnswers: string
  published: boolean
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export interface IQuestionData {
  body: string
  correctAnswers: string
  published?: boolean
}

export interface IQuestionShort {
  id: string
  body: string
}
