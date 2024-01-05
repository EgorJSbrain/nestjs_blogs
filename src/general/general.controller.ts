import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { GeneralRepository } from './general.repository'
import { RoutesEnum } from '../constants/global'
import { GeneralSqlRepository } from './general.sql.repository'

@Controller(RoutesEnum.testing_all_data)
export class GenerealController {
  constructor(
    private generalSqlRepository: GeneralSqlRepository,
    // private generalRepository: GeneralRepository,
  ) {}

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearDB(): Promise<boolean> {
    // return this.generalRepository.clearDB()
    return this.generalSqlRepository.clearDB()
  }
}
