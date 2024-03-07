import { AnswerEntity } from '../entities/answer'

export const sortAnswers = (answers: AnswerEntity[]) =>
  answers.sort((a, b) => {
    const timeA = Number(a.createdAt)
    const timeB = Number(b.createdAt)

    return timeA - timeB
  })
