import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthSqlRepository } from '../auth.repository.sql';

@Injectable()
export class LocalSqlStrategy extends PassportStrategy(Strategy) {
  constructor(private authSqlRepository: AuthSqlRepository) {
    super({
      usernameField: 'loginOrEmail'
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<{ userId: string }> {
    const user = await this.authSqlRepository.verifyUser({ loginOrEmail, password })

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      userId: user.id,
    };
  }
}