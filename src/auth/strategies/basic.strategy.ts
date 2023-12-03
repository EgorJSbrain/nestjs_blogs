
import { BasicStrategy as Strategy } from 'passport-http';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly usersRepository: UsersRepository,
    ) {
        super();
    }

    public validate = async (username: string, password: string): Promise<boolean> => {
      const isUserVerified = await this.usersRepository.verifyBasicHash(
        password,
        'YWRtaW46cXdlcnR5t',
      )

      if (isUserVerified && username === 'admin') {
        return true;
      }

      throw new UnauthorizedException();
    }
}
