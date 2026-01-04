import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Client } from 'node-mailjet';
import { ConfigService } from '@nestjs/config';
import { GeneralService } from '../general/general.service';
import { MailTemplateService } from '../mail-template/mail-template.service';
import { updateMailTemplate } from '../utils/update-mail-template';

@Injectable()
export class MailService {
  private mailjet: Client;

  constructor(
    private configService: ConfigService,
    private generalService: GeneralService,
    private mailTemplateService: MailTemplateService,
  ) {
    this.mailjet = new Client({
      apiKey: this.configService.get<string>('MAILJET_API_KEY')!,
      apiSecret: this.configService.get<string>('MAILJET_SECRET_KEY')!,
    });
  }

  async sendActivationEmail(email: string, url: string) {
    const activationMailOptions =
      await this.mailTemplateService.findPublicMailTemplate('activation');
    if (!activationMailOptions) {
      throw new InternalServerErrorException(
        'No activation mail template found.',
      );
    }

    return this.sendEmail({
      to: email,
      subject: activationMailOptions.subject,
      html: updateMailTemplate(activationMailOptions.html, {
        url,
      }),
    });
  }

  async sendResetPasswordEmail(email: string, url: string) {
    return this.sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `
        <h2>Password reset request</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${url}">${url}</a></p>
        <p>This link expires soon.</p>
      `,
    });
  }

  private async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      const settings = await this.generalService.getSettings();

      await this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: settings.mailjetEmail,
              Name: settings.mailjetName,
            },
            To: [{ Email: to }],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
