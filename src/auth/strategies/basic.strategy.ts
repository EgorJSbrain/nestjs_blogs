
import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UsersRepository } from '../../users/users.repository';

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly usersRepository: UsersRepository,
    ) {
        super();
    }

    public validate = async (username: string, password: string): Promise<boolean> => {
      if (password === 'qwerty' && username === 'admin') {
        return true;
      }

      throw new UnauthorizedException();
    }
}
