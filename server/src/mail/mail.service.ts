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

  /**
   * Письмо о создании заказа.
   * Шлётся при создании заказа (если у покупателя указан email).
   */
  async sendOrderCreatedEmail(params: {
    email: string;
    orderNumber: string;
    firstName?: string;
    total: number;
  }) {
    // Пытаемся взять шаблон из БД (slug = 'order-created').
    // Если его нет — используем дефолтный HTML.
    let subject = `Замовлення ${params.orderNumber} створено`;
    let html = this.defaultOrderCreatedHtml(params);

    try {
      const template =
        await this.mailTemplateService.findPublicMailTemplate('order-created');
      if (template) {
        subject = template.subject;
        html = updateMailTemplate(template.html, {
          orderNumber: params.orderNumber,
          firstName: params.firstName ?? '',
          total: String(params.total),
        });
      }
    } catch {
      // шаблона нет — используем дефолтный
    }

    return this.sendEmail({
      to: params.email,
      subject,
      html,
    });
  }

  /**
   * Письмо об изменении статуса заказа.
   * Шлётся, когда админ меняет статус в админ-панели.
   */
  async sendOrderStatusUpdatedEmail(params: {
    email: string;
    orderNumber: string;
    firstName?: string;
    status: string;
  }) {
    const statusLabel = this.localizeOrderStatus(params.status);

    let subject = `Статус замовлення ${params.orderNumber}: ${statusLabel}`;
    let html = this.defaultOrderStatusUpdatedHtml({
      ...params,
      statusLabel,
    });

    try {
      const template = await this.mailTemplateService.findPublicMailTemplate(
        'order-status-updated',
      );
      if (template) {
        subject = updateMailTemplate(template.subject, {
          orderNumber: params.orderNumber,
          status: statusLabel,
        });
        html = updateMailTemplate(template.html, {
          orderNumber: params.orderNumber,
          firstName: params.firstName ?? '',
          status: statusLabel,
        });
      }
    } catch {
      // шаблона нет — используем дефолтный
    }

    return this.sendEmail({
      to: params.email,
      subject,
      html,
    });
  }

  /**
   * Письмо о смене статуса оплаты (отдельно от статуса заказа).
   */
  async sendOrderPaidEmail(params: {
    email: string;
    orderNumber: string;
    firstName?: string;
  }) {
    const subject = `Оплата за замовлення ${params.orderNumber} отримана`;
    const html = `
      <h2>Дякуємо за оплату${params.firstName ? `, ${this.escapeHtml(params.firstName)}` : ''}!</h2>
      <p>Ми отримали оплату за замовлення <strong>${this.escapeHtml(params.orderNumber)}</strong>.</p>
      <p>Ми одразу приступаємо до обробки.</p>
    `;

    return this.sendEmail({
      to: params.email,
      subject,
      html,
    });
  }

  // ─── helpers ─────────────────────────────────────────────────────────────

  private defaultOrderCreatedHtml(params: {
    orderNumber: string;
    firstName?: string;
    total: number;
  }): string {
    const greeting = params.firstName
      ? `Привіт, ${this.escapeHtml(params.firstName)}!`
      : 'Дякуємо за замовлення!';
    return `
      <h2>${greeting}</h2>
      <p>Ваше замовлення <strong>${this.escapeHtml(params.orderNumber)}</strong> успішно створено.</p>
      <p>Сума до сплати: <strong>${params.total} ₴</strong>.</p>
      <p>Ми зв'яжемося з вами для підтвердження.</p>
    `;
  }

  private defaultOrderStatusUpdatedHtml(params: {
    orderNumber: string;
    firstName?: string;
    statusLabel: string;
  }): string {
    const greeting = params.firstName
      ? `Привіт, ${this.escapeHtml(params.firstName)}!`
      : 'Вітаємо!';
    return `
      <h2>${greeting}</h2>
      <p>Статус вашого замовлення <strong>${this.escapeHtml(params.orderNumber)}</strong> змінено на:
        <strong>${this.escapeHtml(params.statusLabel)}</strong>.
      </p>
      <p>Дякуємо, що обрали наш магазин!</p>
    `;
  }

  private localizeOrderStatus(status: string): string {
    const map: Record<string, string> = {
      pending: 'В очікуванні',
      processing: 'В обробці',
      shipped: 'Відправлено',
      delivered: 'Доставлено',
      completed: 'Завершено',
      cancelled: 'Скасовано',
    };
    return map[status] ?? status;
  }

  private escapeHtml(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
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
