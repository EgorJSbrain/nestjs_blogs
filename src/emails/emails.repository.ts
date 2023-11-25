import { Injectable } from '@nestjs/common';
import { EmailManagerRepository } from 'src/email-manager/email-manager.repository';

import { IUser } from 'src/users/types/user';

@Injectable()
export class EmailsRepository {
  constructor(private emailManager: EmailManagerRepository) {}
  async sendRegistrationConfirmationMail(user: IUser): Promise<boolean> {
    const response = await this.emailManager.sendMailRegistrationConfirmation(user)

    if (!response) return false

    return true
  }

  async sendRecoveryPasswordMail(user: IUser): Promise<boolean> {
    // const response = await emailManager.sendMailRecoveryPassword(user)

    // if (!response) return false

    return true
  }
}
