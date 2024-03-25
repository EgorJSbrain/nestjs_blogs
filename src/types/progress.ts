import { ProgressStatusEnum } from '../enums/ProgressStatusEnum'
import { IAnswer } from './answer'

export interface IProgress {
  id: string
  score: number
  userId: string
  answers: IAnswer[]
  status: ProgressStatusEnum | null
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}
