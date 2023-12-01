import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer'

@Injectable()
export class MailAdapterRepository {
  private transporter;

  constructor(
    private readonly configService: ConfigService
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD')
      }
    })
  }

  async sendActivationMail(to: string, subject: string, mailBody: string): Promise<undefined> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_USER') ?? '',
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
