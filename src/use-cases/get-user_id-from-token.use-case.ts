import { Injectable } from '@nestjs/common'
import { Request } from 'express'

import { JWTService } from '../jwt/jwt.service'

@Injectable()
export class GetUserIdFromTokenUserUseCase {
  constructor(private JWTService: JWTService) {}

  execute(
    req: Request
  ) {
    let currentUserId: string | null = null

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      try {
        const { userId } = this.JWTService.verifyAccessToken(token)

        currentUserId = userId || null
      } catch {
        currentUserId = null
      }
    }

    return currentUserId
  }
}