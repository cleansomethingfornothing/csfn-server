import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import PasswordReset from '../domain/password-reset/password-reset.entity'

@Injectable()
export class EmailService {

  constructor(private readonly mailerService: MailerService) {
  }

  sendPasswordResetEmail(reset: PasswordReset) {
    return this.mailerService.sendMail({
      to: reset.email,
      subject: 'Password Recovery',
      html: `Click here to reset your password: <br> <a href="${process.env.APP_URL}/static/password-recovery.html?code=${reset.code}">Reset Password</a>`
    })
  }

}
