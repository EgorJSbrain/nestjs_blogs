import { IAnswer } from "./answer"

export interface IProgress {
  id: string
  score: number
  userId: string
  answers: IAnswer[]
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}
