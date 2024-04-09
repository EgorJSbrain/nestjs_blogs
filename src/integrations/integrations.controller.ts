import {
  Controller,
  Post,
  Body,
} from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { RoutesEnum } from '../constants/global'


@Controller(RoutesEnum.integrations)
export class IntegrationsController {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  @Post('telegram/webhook')
  async forTelegram(@Body() body: any): Promise<any> {
    console.log("--1-body:", body)
  }
}
