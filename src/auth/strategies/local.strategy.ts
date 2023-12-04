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
    console.log("validate----password:", password)
    console.log("validate----loginOrEmail:", loginOrEmail)
    const user = await this.authRepository.verifyUser({ loginOrEmail, password })

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      userId: user.id,
    };
  }
}