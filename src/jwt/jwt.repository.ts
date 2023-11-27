import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtRepository {
  constructor(private readonly jwtService: NestJwtService) {}

  generateAcessToken(userId: string, password: string): string {
    return this.jwtService.sign({ userId, password }, { secret: process.env.ACCESS_SECRET_KEY });
  }

  generateRefreshToken(userId: string, password: string): string {
    return this.jwtService.sign({ userId, password }, { secret: process.env.REFRESH_SECRET_KEY });
  }

  async verifyRefreshToken(token: string): Promise<{ userId?: string, password?: string }> {
    return await this.jwtService.verifyAsync<{ userId: string, password: string }>(token, {
      secret: process.env.REFRESH_SECRET_KEY
    })
  }

  verifyAccessToken(token: string): { userId?: string, password?: string } {
    return this.jwtService.verify<{ userId: string, password: string }>(token, {
      secret: process.env.ACCESS_SECRET_KEY
    })
  }
}