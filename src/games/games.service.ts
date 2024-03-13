import { Injectable } from '@nestjs/common'

import { CreateDeviceDto } from '../dtos/devices/create-device.dto'
import { GamesRepository } from './games.repository'
import { EntityManager } from 'typeorm'
import { GameEntity } from '../entities/game'
import { GameStatusEnum } from '../enums/gameStatusEnum'

@Injectable()
export class GamesService {
  constructor(
    private readonly gamesRepository: GamesRepository,
  ) {}

  async finishCurrentGame(gameId: string, manager: EntityManager) {
     const currentGame = await this.gamesRepository.getById(gameId)

     if (!currentGame) {
      return null
     }

     currentGame.finishGameDate = new Date()
     currentGame.status = GameStatusEnum.finished

     return manager.save(currentGame)
  }
}
