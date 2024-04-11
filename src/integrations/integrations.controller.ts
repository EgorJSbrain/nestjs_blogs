import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { RoutesEnum } from '../constants/global'
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUserId } from '../auth/current-user-id.param.decorator'
import { IntegrationService } from './integrations.service'
import { InitiateChatWithUserUseCase } from './use-cases/initiate-chat-with-user.use-case'


@Controller(RoutesEnum.integrations)
export class IntegrationsController {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private integrationService: IntegrationService,
    private initiateChatWithUserUseCase: InitiateChatWithUserUseCase,
  ) {}

  @Post('telegram/webhook')
  async forTelegramWebhook(@Body() body: any): Promise<any> {
    await this.initiateChatWithUserUseCase.execute(body?.message?.chat.id, body?.message?.text ?? '')

    return
  }

  @Get('telegram/auth-bot-link')
  @UseGuards(JWTAuthGuard)
  async forTelegram(@CurrentUserId() userId: string): Promise<any> {
   return this.integrationService.getTelegramBotLink(userId)
  }
}
