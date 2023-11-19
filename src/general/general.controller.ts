import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { GeneralRepository } from './general.repository'

@Controller('testing/all-data')
export class GenerealController {
  constructor(private generalRepository: GeneralRepository) {}

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearDB(): Promise<boolean> {
    return this.generalRepository.clearDB()
  }
}
