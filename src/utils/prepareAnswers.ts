import { sortAnswers } from './sortAnswers'
import { AnswerEntity } from '../entities/answer'

export const prepareAnswers = (answers: AnswerEntity[]) =>
  sortAnswers(answers || []).map((answer) => ({
    questionId: answer.questionId,
    answerStatus: answer.answerStatus,
    addedAt: answer.createdAt
  }))
