import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Client } from 'node-mailjet';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private mailjet: Client;

  private readonly fromEmail: string;
  private readonly fromName: string;
  constructor(private configService: ConfigService) {
    this.mailjet = new Client({
      apiKey: this.configService.get<string>('MAILJET_API_KEY')!,
      apiSecret: this.configService.get<string>('MAILJET_SECRET_KEY')!,
    });

    this.fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL')!;
    this.fromName = this.configService.get<string>('MAIL_FROM_NAME')!;
  }

  async sendActivationEmail(email: string, url: string) {
    return this.sendEmail({
      to: email,
      subject: 'Activate your account',
      html: `
        <h2>Welcome!</h2>
        <p>Please click the link below to activate your account:</p>
        <p><a href="${url}">${url}</a></p>
        <p>If you did not create this account, ignore this email.</p>
      `,
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
      await this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: this.fromEmail,
              Name: this.fromName,
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
