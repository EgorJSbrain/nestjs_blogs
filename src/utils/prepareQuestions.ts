import { GameQuestionEntity } from '../entities/game-question'
import { sortQuestions } from './sortQuestions'

export const prepareQuestions = (questions: GameQuestionEntity[]) =>
  sortQuestions(questions).map((question) => ({
    id: question.id,
    body: question.question.body
  }))
