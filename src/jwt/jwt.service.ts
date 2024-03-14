import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JWTService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService
  ) {}

  generateAcessToken(userId: string): string {
    return this.jwtService.sign(
      { userId },
      { secret: this.configService.get<string>('ACCESS_SECRET_KEY'), expiresIn: '30m' }
    )
  }

  generateRefreshToken(userId: string, lastActiveDate: string, deviceId: string): string {
    return this.jwtService.sign(
      { userId, lastActiveDate, deviceId },
      { secret: this.configService.get<string>('REFRESH_SECRET_KEY'), expiresIn: '60m' }
    )
  }

  async verifyRefreshToken(
    token: string
  ): Promise<{ userId?: string; deviceId?: string, lastActiveDate?: string }> {
    try {
      const { userId, deviceId, lastActiveDate } = await this.jwtService.verifyAsync<{
        userId: string
        deviceId: string,
        lastActiveDate: string,
      }>(token, {
        secret: this.configService.get<string>('REFRESH_SECRET_KEY'),
        ignoreExpiration: false
      })

      return { userId, deviceId, lastActiveDate }
    } catch {
      throw new UnauthorizedException()
    }
  }

  verifyAccessToken(token: string): { userId?: string; password?: string } {
    return this.jwtService.verify<{ userId: string; password: string }>(token, {
      secret: this.configService.get<string>('ACCESS_SECRET_KEY')
    })
  }
}