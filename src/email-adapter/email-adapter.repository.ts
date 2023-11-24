import { Injectable } from '@nestjs/common'
import nodemailer from 'nodemailer'

@Injectable()
export class MailAdapterRepository {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })

    // this.init()
  }

  // init() {
  //   console.log('---', this.transporter)
  // }

  async sendActivationMail(to: string, subject: string, mailBody: string): Promise<undefined> {
    console.log('----3---')
    await this.transporter.sendMail({
      from: process.env.SMTP_USER ?? '  ',
      to,
      subject,
      html: mailBody
    })
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
