import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtRepository {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService
  ) {}

  generateAcessToken(userId: string, password: string): string {
    return this.jwtService.sign(
      { userId, password },
      { secret: this.configService.get<string>('ACCESS_SECRET_KEY'), expiresIn: '10m' }
    )
  }

  generateRefreshToken(userId: string, password: string): string {
    return this.jwtService.sign(
      { userId, password },
      { secret: this.configService.get<string>('REFRESH_SECRET_KEY'), expiresIn: '2h' }
    )
  }

  async verifyRefreshToken(
    token: string
  ): Promise<{ userId?: string; password?: string }> {
    return await this.jwtService.verifyAsync<{
      userId: string
      password: string
    }>(token, {
      secret: this.configService.get<string>('REFRESH_SECRET_KEY')
    })
  }

  verifyAccessToken(token: string): { userId?: string; password?: string } {
    return this.jwtService.verify<{ userId: string; password: string }>(token, {
      secret: process.env.ACCESS_SECRET_KEY
    })
  }
}