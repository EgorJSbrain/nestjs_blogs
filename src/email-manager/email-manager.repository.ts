import { Injectable } from '@nestjs/common'

import { MailAdapterRepository } from 'src/email-adapter/email-adapter.repository'
import { IUser } from 'src/users/types/user'

@Injectable()
export class EmailManagerRepository {
  constructor(private mailAdapter: MailAdapterRepository,){}
  async sendMailRegistrationConfirmation(email: string, code?: string) {
    try {
      const message = `
        <h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
          <a href='https://somesite.com/confirm-email?code=${code}'>
            complete registration
          </a>
        </p>
      `
      await this.mailAdapter.sendActivationMail(
        email,
        'Confirm registration',
        message
      )

      return true
    } catch {
      return null
    }
  }

  async sendMailRecoveryPassword(email: string, code: string) {
    try {
      const message = `
        <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>
      `
      await this.mailAdapter.sendActivationMail(
        email,
        'Password recovery',
        message
      )

      return true
    } catch {
      return null
    }
  }
}

