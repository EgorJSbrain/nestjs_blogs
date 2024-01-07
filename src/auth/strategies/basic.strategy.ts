
import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super();
    }

    public validate = async (username: string, password: string): Promise<boolean> => {
      if (password === 'qwerty' && username === 'admin') {
        return true;
      }

      throw new UnauthorizedException();
    }
}
