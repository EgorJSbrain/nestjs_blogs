import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../auth.repository';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authRepository: AuthRepository) {
    super({
      usernameField: 'loginOrEmail'
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<{ userId: string }> {
    const user = await this.authRepository.verifyUser({ loginOrEmail, password })

    if (!user) {
      console.log("1")
      throw new UnauthorizedException();
    }

    return {
      userId: user.id,
    };
  }
}