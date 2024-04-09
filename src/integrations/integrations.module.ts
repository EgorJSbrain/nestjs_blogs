import { Module } from '@nestjs/common';
import { JwtModule as JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { IntegrationService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [],
  controllers: [IntegrationsController],
  providers: [IntegrationService]
})
export class IntegrationsModule {}
