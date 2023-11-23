import { IUser } from 'src/users/types/user'
// import { emailManager } from '../managers/email-manager'
import { Injectable } from '@nestjs/common'
import nodemailer from 'nodemailer'
import { ConfigurationRepository } from 'src/configuration/configuration.repository';

@Injectable()
export class MailRepository {
  private transporter;

  constructor(private configuratioRepository: ConfigurationRepository) {
    // const smtp_user = this.configuratioRepository.getSMTP().then(res => res)

    // this.transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD
    //   }
    // })
  }
  // async sendRegistrationConfirmationMail(user: IUser): Promise<boolean> {
  //   const response = await emailManager.sendMailRegistrationConfirmation(user)

  //   if (!response) return false

  //   return true
  // }

  // async sendRecoveryPasswordMail(user: IUser): Promise<boolean> {
  //   const response = await emailManager.sendMailRecoveryPassword(user)

  //   if (!response) return false

  //   return true
  // }
}
