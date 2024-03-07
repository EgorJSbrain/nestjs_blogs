import { GameQuestionEntity } from '../entities/game-question'

export const sortQuestions = (questions: GameQuestionEntity[]) =>
  questions.sort((a, b) => a.order - b.order)
