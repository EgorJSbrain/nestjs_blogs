import {
  Controller,
  Delete,
} from '@nestjs/common'
import { GeneralRepository } from './general.repository'

@Controller('testing/all-data')
export class GenerealController {
  constructor(private generalRepository: GeneralRepository) {}

  @Delete()
  async clearDB(): Promise<boolean> {
    return this.generalRepository.clearDB()
  }
}
