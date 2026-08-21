import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { SubscribeDto } from './dto/subscribe.dto';
import { SubscribersQueryDto } from './dto/subscribers-query.dto';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subscriberModel: Model<SubscriberDocument>,
  ) {}

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /** Публічна підписка з форми на сайті. Ідемпотентна: повторна підписка активує, якщо була відписка. */
  async subscribe(dto: SubscribeDto) {
    const email = dto.email.trim().toLowerCase();
    if (!email) throw new BadRequestException('Email is required');

    const existing = await this.subscriberModel.findOne({ email });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return { _id: String(existing._id), email, reactivated: !existing.isActive };
    }

    const created = await this.subscriberModel.create({
      email,
      isActive: true,
      source: dto.source ?? 'footer',
      locale: dto.locale ?? 'ua',
      unsubscribeToken: this.generateToken(),
    });

    return { _id: String(created._id), email };
  }

  /** One-click unsubscribe за токеном (з листа). */
  async unsubscribeByToken(token: string) {
    const sub = await this.subscriberModel.findOne({ unsubscribeToken: token });
    if (!sub) throw new NotFoundException('Subscriber not found');
    sub.isActive = false;
    await sub.save();
    return { email: sub.email };
  }

  async findAllAdmin(query: SubscribersQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 50;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<SubscriberDocument> = {};
    if (query.search) {
      const safe = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.email = { $regex: safe, $options: 'i' };
    }
    if (query.isActive === 'true') filter.isActive = true;
    if (query.isActive === 'false') filter.isActive = false;

    const [data, totalDocuments] = await Promise.all([
      this.subscriberModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.subscriberModel.countDocuments(filter),
    ]);

    return {
      data,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      page,
      limit,
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Subscriber not found');
    }
    const deleted = await this.subscriberModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Subscriber not found');
    return null;
  }

  /** Список активних підписників для розсилки. */
  async findAllActive(): Promise<Array<Pick<SubscriberDocument, 'email' | 'unsubscribeToken'>>> {
    return this.subscriberModel
      .find({ isActive: true }, { email: 1, unsubscribeToken: 1 })
      .lean();
  }

  async countActive(): Promise<number> {
    return this.subscriberModel.countDocuments({ isActive: true });
  }
}
