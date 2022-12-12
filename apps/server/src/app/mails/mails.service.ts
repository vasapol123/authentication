import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { sendMailPayload } from '@authentication/types';

@Injectable()
export class MailsService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendResetPasswordEmail(
    payload: sendMailPayload,
    sendMailOptions: ISendMailOptions,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        ...sendMailOptions,
        to: payload.toEmail,
        from: sendMailOptions.from,
        subject: sendMailOptions.subject,
        template: 'reset-password',
        context: {
          payload: payload,
        },
      });

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
