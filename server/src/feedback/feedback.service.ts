import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackQueryDto } from './dto/feedback-query.dto';
import { FeedbackType } from './enum/feedback.enums';
import { TelegramService } from '../telegram/telegram.service';

const FEEDBACK_TYPE_LABEL: Record<FeedbackType, string> = {
  [FeedbackType.CONTACTS]: 'Контакти',
};

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectModel(Feedback.name)
    private feedbackModel: Model<FeedbackDocument>,
    private telegramService: TelegramService,
  ) {}

  async create(dto: CreateFeedbackDto) {
    const created = await this.feedbackModel.create({
      type: dto.type,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      phoneNumber: dto.phoneNumber.trim(),
      email: dto.email.trim().toLowerCase(),
      message: dto.message?.trim() ?? '',
      isAgree: dto.isAgree,
    });

    void this.notifyTelegram(created).catch((err) =>
      this.logger.error(
        `Failed to send Telegram feedback notification: ${(err as Error).message}`,
      ),
    );

    return { _id: String(created._id), createdAt: created.get('createdAt') };
  }

  async findAll(query: FeedbackQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 25;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<FeedbackDocument> = {};
    if (query.type) filter.type = query.type;
    if (query.isRead === 'true') filter.isRead = true;
    if (query.isRead === 'false') filter.isRead = false;
    if (query.search) {
      const safe = query.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { firstName: { $regex: safe, $options: 'i' } },
        { lastName: { $regex: safe, $options: 'i' } },
        { email: { $regex: safe, $options: 'i' } },
        { phoneNumber: { $regex: safe, $options: 'i' } },
        { message: { $regex: safe, $options: 'i' } },
      ];
    }

    const [data, totalDocuments] = await Promise.all([
      this.feedbackModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.feedbackModel.countDocuments(filter),
    ]);

    return {
      data,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      page,
      limit,
    };
  }

  async markAsRead(id: string, isRead: boolean) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Feedback not found');
    }
    const updated = await this.feedbackModel
      .findByIdAndUpdate(id, { $set: { isRead } }, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('Feedback not found');
    return updated;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Feedback not found');
    }
    const deleted = await this.feedbackModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Feedback not found');
    return null;
  }

  private async notifyTelegram(feedback: FeedbackDocument) {
    const esc = (v: unknown) => this.telegramService.escapeHtml(v as string);
    const typeLabel =
      FEEDBACK_TYPE_LABEL[feedback.type as FeedbackType] ?? feedback.type;

    const lines: string[] = [
      '📩 <b>Нова заявка</b>',
      `<b>Тип:</b> ${esc(typeLabel)}`,
      '',
      `<b>Від:</b> ${esc(feedback.firstName)} ${esc(feedback.lastName)}`,
      `📞 ${esc(feedback.phoneNumber)}`,
      `📧 ${esc(feedback.email)}`,
    ];
    if (feedback.message) {
      lines.push('', `<b>Повідомлення:</b>`, esc(feedback.message));
    }
    await this.telegramService.sendMessage({
      text: lines.join('\n'),
    });
  }
}
