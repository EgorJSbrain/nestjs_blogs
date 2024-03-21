import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { differenceInSeconds } from 'date-fns';
import { AnswerEntity } from 'src/entities/answer';
import { GamesService } from 'src/games/games.service';
import { In, Repository, IsNull, LessThanOrEqual } from 'typeorm';

const getLastAnswer = (answers: AnswerEntity[]) => {
  const sortedAnswers = answers.map(answer => ({
    ...answer,
    createdAtMilliseconds: Number(answer.createdAt)
  }))
  .sort((a, b) => a.createdAtMilliseconds - b.createdAtMilliseconds) || []

  return sortedAnswers[sortedAnswers?.length - 1]
}

@Injectable()
export class CronService {
  constructor(
    private readonly gamesService: GamesService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async genAttempts() {
    const games = await this.gamesService.getAciveGames()
    const date = new Date()

    games?.forEach(game => {
      if (!game.firstPlayerProgress || !game.secondPlayerProgress) {
        return null
      }

      const firstUserAnswers = game.firstPlayerProgress.answers || []
      const secondUserAnswers = game.secondPlayerProgress.answers || []
      const gameQuestions = game.questions || []
      // console.log("-----------gameQuestions:", gameQuestions)
      // console.log("----------firstUserAnswers:", firstUserAnswers)

      if (firstUserAnswers?.length === 5) {
        const firstUserLastAnswer = getLastAnswer(firstUserAnswers)

        const diff = differenceInSeconds(date, firstUserLastAnswer.createdAt)

        // console.log("---1----diff:", diff)
      }

      if (secondUserAnswers.length === 5 && firstUserAnswers.length < 5) {
        const secondUserLastAnswer = getLastAnswer(secondUserAnswers)

        const diff = differenceInSeconds(date, secondUserLastAnswer.createdAt)
        if (diff >= 10) {
          const unansweredQuestion = gameQuestions.filter(question => {

            if (firstUserAnswers.find(answer => answer.questionId === question.id)) {
              return undefined
            }

            return question
          })

          // TODO  1. replace answerToGameQuestion to gameService(?); 2. and start answerToGameQuestion for each unanswered question of game set '' for answer
          // console.log("---2----unansweredQuestion:", unansweredQuestion)
          // console.log("---2----diff:", diff)
        }
      }
    })
  }
}
