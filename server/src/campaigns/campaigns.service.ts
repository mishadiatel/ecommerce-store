import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  Campaign,
  CampaignDocument,
  CampaignStatus,
} from './schemas/campaign.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { SubscribersService } from '../subscribers/subscribers.service';
import { MailService } from '../mail/mail.service';
import { BaseQueryDto } from '../utils/base-query.dto';

/** Пауза між сендами, щоб не перевищити ліміт Mailjet. */
const SEND_DELAY_MS = 100;

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectModel(Campaign.name)
    private campaignModel: Model<CampaignDocument>,
    private subscribersService: SubscribersService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async create(dto: CreateCampaignDto) {
    return this.campaignModel.create({
      subject: dto.subject.trim(),
      html: dto.html,
      status: CampaignStatus.DRAFT,
    });
  }

  async findAll(query: BaseQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<CampaignDocument> = {};
    if (query.search) {
      const safe = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.subject = { $regex: safe, $options: 'i' };
    }

    const [data, totalDocuments] = await Promise.all([
      this.campaignModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.campaignModel.countDocuments(filter),
    ]);

    return {
      data,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      page,
      limit,
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Campaign not found');
    }
    const doc = await this.campaignModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Campaign not found');
    return doc;
  }

  async update(id: string, dto: UpdateCampaignDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Campaign not found');
    }
    const doc = await this.campaignModel.findById(id);
    if (!doc) throw new NotFoundException('Campaign not found');
    if (doc.status === CampaignStatus.SENDING) {
      throw new BadRequestException('Cannot edit campaign while sending');
    }
    if (dto.subject !== undefined) doc.subject = dto.subject.trim();
    if (dto.html !== undefined) doc.html = dto.html;
    await doc.save();
    return doc.toObject();
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Campaign not found');
    }
    const doc = await this.campaignModel.findById(id);
    if (!doc) throw new NotFoundException('Campaign not found');
    if (doc.status === CampaignStatus.SENDING) {
      throw new BadRequestException('Cannot delete campaign while sending');
    }
    await doc.deleteOne();
    return null;
  }

  /** Тестовий send одному отримувачу — БЕЗ підстановки unsubscribe-токена. */
  async testSend(id: string, toEmail: string) {
    const campaign = await this.findOne(id);
    const html = this.renderHtml(campaign.html, `${this.baseUrl()}/?unsubscribed=1`);
    await this.mailService.sendRawEmail(toEmail, campaign.subject, html);
    return { ok: true };
  }

  /**
   * Масова розсилка активним підписникам. Не блокує запит на весь час
   * розсилки — стартує в фоновому режимі і одразу повертає 202.
   */
  async sendToAll(id: string) {
    const doc = await this.campaignModel.findById(id);
    if (!doc) throw new NotFoundException('Campaign not found');
    if (doc.status === CampaignStatus.SENDING) {
      throw new BadRequestException('Campaign is already sending');
    }
    if (doc.status === CampaignStatus.SENT) {
      throw new BadRequestException('Campaign has already been sent');
    }

    const subscribers = await this.subscribersService.findAllActive();
    if (subscribers.length === 0) {
      throw new BadRequestException('No active subscribers to send to');
    }

    doc.status = CampaignStatus.SENDING;
    doc.recipientsCount = subscribers.length;
    doc.sentCount = 0;
    doc.failedCount = 0;
    doc.lastError = '';
    await doc.save();

    const campaignIdStr = String(doc._id);
    void this.dispatchInBackground(campaignIdStr, subscribers, doc.subject, doc.html)
      .catch((err) => this.logger.error(`Campaign ${id} background send crashed: ${(err as Error).message}`));

    return {
      campaignId: campaignIdStr,
      status: doc.status,
      recipientsCount: doc.recipientsCount,
    };
  }

  /** Фоновий цикл відправки з rate-limit. */
  private async dispatchInBackground(
    campaignId: string,
    subscribers: Array<{ email: string; unsubscribeToken: string }>,
    subject: string,
    htmlTemplate: string,
  ) {
    let sentCount = 0;
    let failedCount = 0;
    let lastError = '';

    for (const sub of subscribers) {
      const unsubscribeUrl = `${this.apiBaseUrl()}/api/subscribers/unsubscribe/${sub.unsubscribeToken}`;
      const html = this.renderHtml(htmlTemplate, unsubscribeUrl);
      try {
        await this.mailService.sendRawEmail(sub.email, subject, html);
        sentCount++;
      } catch (err) {
        failedCount++;
        lastError = (err as Error).message ?? 'unknown';
        this.logger.warn(
          `Campaign ${campaignId}: failed to send to ${sub.email}: ${lastError}`,
        );
      }
      // Оновлюємо лічильники кожні 25 листів (щоб не заспамити БД).
      if ((sentCount + failedCount) % 25 === 0) {
        await this.campaignModel.updateOne(
          { _id: campaignId },
          { $set: { sentCount, failedCount, lastError } },
        );
      }
      if (SEND_DELAY_MS > 0) {
        await new Promise((r) => setTimeout(r, SEND_DELAY_MS));
      }
    }

    await this.campaignModel.updateOne(
      { _id: campaignId },
      {
        $set: {
          sentCount,
          failedCount,
          lastError,
          status: failedCount > 0 && sentCount === 0 ? CampaignStatus.FAILED : CampaignStatus.SENT,
          sentAt: new Date(),
        },
      },
    );
  }

  /**
   * Додає у HTML футер з посиланням відписки, якщо його ще немає.
   * Плейсхолдер `{{unsubscribeUrl}}` у HTML буде замінено на URL.
   */
  private renderHtml(html: string, unsubscribeUrl: string): string {
    if (html.includes('{{unsubscribeUrl}}')) {
      return html.split('{{unsubscribeUrl}}').join(unsubscribeUrl);
    }
    // Автоматично додаємо футер, якщо адмін не вставив плейсхолдер
    const footer = `
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="font-size: 12px; color: #6b7280; text-align: center;">
        Ви отримали цей лист, оскільки підписались на розсилку.
        <br />
        <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Відписатися</a>
      </p>
    `;
    return html + footer;
  }

  private baseUrl(): string {
    return (
      this.configService.get<string>('APP_PUBLIC_URL')?.replace(/\/+$/, '') ??
      ''
    );
  }

  private apiBaseUrl(): string {
    return (
      this.configService.get<string>('API_PUBLIC_URL')?.replace(/\/+$/, '') ??
      ''
    );
  }
}
