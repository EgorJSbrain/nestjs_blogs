import { IExtendedGame } from 'src/types/game'
import { prepareGameProgress } from './prepareGameProgress'
import { prepareQuestions } from './prepareQuestions'

export const prepareGame = (game: IExtendedGame) => ({
  id: game.id,
  firstPlayerProgress: game.firstPlayerProgress
    ? prepareGameProgress(game.firstPlayerProgress)
    : null,
  secondPlayerProgress: game.secondPlayerProgress
    ? prepareGameProgress(game.secondPlayerProgress)
    : null,
  questions: game.questions ? prepareQuestions(game.questions) : null,
  status: game.status,
  pairCreatedDate: game.createdAt,
  startGameDate: game.startGameDate,
  finishGameDate: game.finishGameDate
})
