import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'

import { JWTService } from '../jwt/jwt.service'
import { HashService } from '../hash/hash.service'
import { QuestionsRepository } from './questions.repository'
import { QuestionEntity } from '../entities/question'
import { QuestionsSAController } from './questions.controller.sa'

@Module({
  imports: [TypeOrmModule.forFeature([QuestionEntity])],
  controllers: [QuestionsSAController],
  providers: [JWTService, JwtService, QuestionsRepository, HashService]
})
export class QuestionsModule {}
