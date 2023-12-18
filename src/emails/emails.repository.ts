import { Injectable } from '@nestjs/common';
import { EmailManagerRepository } from '../email-manager/email-manager.repository';

@Injectable()
export class EmailsRepository {
  constructor(private emailManager: EmailManagerRepository) {}
  async sendRegistrationConfirmationMail(email: string, code: string): Promise<boolean> {
    const response = await this.emailManager.sendMailRegistrationConfirmation(email, code)

    if (!response) return false

    return true
  }

  async sendRecoveryPasswordMail(email: string, code: string): Promise<boolean> {
    const response = await this.emailManager.sendMailRecoveryPassword(email, code)

    if (!response) return false

    return true
  }
}
