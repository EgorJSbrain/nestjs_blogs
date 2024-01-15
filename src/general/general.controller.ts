import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { RoutesEnum } from '../constants/global'
import { GeneralSqlRepository } from './general.sql.repository'
import { SkipThrottle } from '@nestjs/throttler'

@SkipThrottle()
@Controller(RoutesEnum.testing_all_data)
export class GenerealController {
  constructor(
    private generalSqlRepository: GeneralSqlRepository,
  ) {}

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearDB(): Promise<boolean> {
    return this.generalSqlRepository.clearDB()
  }
}
