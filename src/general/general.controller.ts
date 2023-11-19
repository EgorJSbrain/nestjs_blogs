import {
  Controller,
  Delete,
  HttpCode,
} from '@nestjs/common'
import { GeneralRepository } from './general.repository'
import { HTTP_STATUSES } from '../constants/general'

@Controller('testing/all-data')
export class GenerealController {
  constructor(private generalRepository: GeneralRepository) {}

  @Delete()
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async clearDB(): Promise<boolean> {
    return this.generalRepository.clearDB()
  }
}
