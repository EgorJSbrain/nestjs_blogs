
import { BasicStrategy as Strategy } from 'passport-http';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersRepository: UsersRepository,
    ) {
        super();
    }

    public validate = async (username: string, password: string): Promise<boolean> => {
      const user = await this.usersRepository.getUserByLoginOrEmail(username, username)

        if (!user) {
          throw new HttpException(
            { message: 'Username is not correct' },
            HttpStatus.BAD_REQUEST
          )
        }

        const isUserVerified = await this.usersRepository.verifyBasicHash(
          password,
          user.basicHash,
        )

        if (isUserVerified) {
            return true;
        }

        throw new UnauthorizedException();
    }
}
