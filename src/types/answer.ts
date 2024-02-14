import { AnswerStatusEnum } from "src/constants/answer"

export interface IAnswer {
  id: string
  questionId: string
  progressId: string
  userId: string
  answerStatus: AnswerStatusEnum
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}
