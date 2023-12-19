import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JWTService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService
  ) {}

  generateAcessToken(userId: string, password: string): string {
    return this.jwtService.sign(
      { userId, password },
      { secret: this.configService.get<string>('ACCESS_SECRET_KEY'), expiresIn: '10s' }
    )
  }

  generateRefreshToken(userId: string, password: string): string {
    return this.jwtService.sign(
      { userId, password },
      { secret: this.configService.get<string>('REFRESH_SECRET_KEY'), expiresIn: '20s' }
    )
  }

  async verifyRefreshToken(
    token: string
  ): Promise<{ userId?: string; password?: string }> {
    try {
      const { userId, password } = await this.jwtService.verifyAsync<{
        userId: string
        password: string
      }>(token, {
        secret: this.configService.get<string>('REFRESH_SECRET_KEY'),
        ignoreExpiration: false
      })

      return { userId, password }
    } catch {
      throw new UnauthorizedException()
    }
  }

  verifyAccessToken(token: string): { userId?: string; password?: string } {
    return this.jwtService.verify<{ userId: string; password: string }>(token, {
      secret: process.env.ACCESS_SECRET_KEY
    })
  }
}