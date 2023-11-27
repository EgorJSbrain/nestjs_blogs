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

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify<{userId: string}>(token, { secret: process.env.REFRESH_SECRET_KEY });
    } catch (error) {
      // Handle token verification errors (e.g., token expired)
      throw new Error('Invalid token');
    }
  }
}