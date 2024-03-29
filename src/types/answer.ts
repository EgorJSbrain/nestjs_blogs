import { AnswerStatusEnum } from "src/constants/answer"

export interface IAnswer {
  id: string
  progressId: string
  userId: string
  answerStatus: AnswerStatusEnum
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export type Answer = {
  questionId: string,
  answerStatus: AnswerStatusEnum,
  addedAt: Date
}
