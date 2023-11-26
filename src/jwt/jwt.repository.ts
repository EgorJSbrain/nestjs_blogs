import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtRepository {
  constructor(private readonly jwtService: NestJwtService) {}

  generateAcessToken(payload: string): string {
    return this.jwtService.sign(payload, { secret: process.env.ACCESS_SECRET_KEY });
  }
  generateRefreshToken(payload: string): string {
    return this.jwtService.sign(payload, { secret: process.env.REFRESH_SECRET_KEY });
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      // Handle token verification errors (e.g., token expired)
      throw new Error('Invalid token');
    }
  }
}