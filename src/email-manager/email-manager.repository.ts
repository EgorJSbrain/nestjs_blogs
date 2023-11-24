import { Injectable } from '@nestjs/common'

import { MailAdapterRepository } from 'src/email-adapter/email-adapter.repository'
import { IUser } from 'src/users/types/user'

@Injectable()
export class EmailManagerRepository {
  constructor(private mailAdapter: MailAdapterRepository,){}
  async sendMailRegistrationConfirmation(user: IUser) {
    console.log('----2---')
    try {
      const message = `
        <h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
          <a href='https://somesite.com/confirm-email?code=${'someCode'}'>
            complete registration
          </a>
        </p>
      `
      await this.mailAdapter.sendActivationMail(
        user.email,
        'Confirm registration',
        message
      )

      return true
    } catch {
      return null
    }
  }

  async sendMailRecoveryPassword(user: IUser) {
    try {
      const message = `
        <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${'someCode'}'>recovery password</a>
        </p>
      `
      await this.mailAdapter.sendActivationMail(
        user.email,
        'Confirm registration',
        message
      )

      return true
    } catch {
      return null
    }
  }
}

