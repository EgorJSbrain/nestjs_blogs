import { ProgressEntity } from '../entities/progress'
import { prepareAnswers } from './prepareAnswers'

export const prepareGameProgress = (progress: ProgressEntity) => ({
  answers: prepareAnswers(progress.answers),
  player: {
    id: progress?.userId,
    login: progress?.user.login
  },
  score: progress?.score
})
