import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'

import { ProgressEntity } from '../entities/progress'
import { ProgressStatusEnum } from 'src/enums/ProgressStatusEnum'

@Injectable()
export class ProgressService {
  constructor() {}

  async markProgressesByResult(firstProgressId: string, secondProgressId: string, manager: EntityManager) {
    const currentUserProgress = await manager.findOne(ProgressEntity, {
      where: {
        id: firstProgressId
      }
    })

    const anotherUserProgress = await manager.findOne(ProgressEntity, {
      where: {
        id: secondProgressId
      }
    })

    if (!currentUserProgress || !anotherUserProgress) {
      return null
    }

    if (anotherUserProgress.score === currentUserProgress.score) {
      currentUserProgress.status = ProgressStatusEnum.draw
      anotherUserProgress.status = ProgressStatusEnum.draw

      manager.save(currentUserProgress)
      return manager.save(anotherUserProgress)
    } else if (anotherUserProgress.score > currentUserProgress.score) {
      anotherUserProgress.status = ProgressStatusEnum.win
      currentUserProgress.status = ProgressStatusEnum.lose

      manager.save(currentUserProgress)
      return manager.save(anotherUserProgress)
    } else {
      anotherUserProgress.status = ProgressStatusEnum.lose
      currentUserProgress.status = ProgressStatusEnum.win

      manager.save(currentUserProgress)
      return manager.save(anotherUserProgress)
    }
  }
}
