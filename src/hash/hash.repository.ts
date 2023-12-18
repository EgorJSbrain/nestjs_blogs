import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt'

@Injectable()
export class HashRepository {
  constructor() {}

  async generateHash(
    password: string
  ): Promise<{ passwordSalt: string; passwordHash: string }> {
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, passwordSalt)

    return {
      passwordSalt,
      passwordHash
    }
  }

  async comparePassword(
    password: string,
    userHashedPassword: string,
  ): Promise<boolean> {
    const isComparedPassword = await bcrypt.compare(password, userHashedPassword)

    return isComparedPassword
  }
}
