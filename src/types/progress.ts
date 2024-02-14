export interface IProgress {
  id: string
  score: number
  userId: string
  answers: any[]
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}
