import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../auth.repository';
import { UserDocument } from 'src/users/users.schema';
import { IUser } from 'src/users/types/user';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authRepository: AuthRepository) {
    super({
      usernameField: 'loginOrEmail'
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<IUser> {
    const user = await this.authRepository.verifyUser({ loginOrEmail, password })

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt
    };
  }
}