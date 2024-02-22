export interface IGameQuestion {
  id: string
  gameId: string | null
  questionId: string | null
  order: number | null
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

