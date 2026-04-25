import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { PromoCode, PromoCodeDocument } from './schema/promo-code.schema';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PromoCodeQueryDto } from './dto/promo-code-query.dto';
import { PromoDiscountType } from './enum/promo-code.enums';

/** Результат валідації промокоду. */
export interface PromoCodeValidationResult {
  promoCode: PromoCodeDocument;
  /** Сума, на яку зменшиться замовлення. Вже нормалізована: не перевищує cartTotal, округлена до 2 знаків. */
  discountAmount: number;
}

@Injectable()
export class PromoCodeService {
  constructor(
    @InjectModel(PromoCode.name)
    private readonly promoCodeModel: Model<PromoCodeDocument>,
  ) {}

  // ─── Приватні хелпери ─────────────────────────────────────────────────────

  private parseDateOrNull(value: string | null | undefined): Date | null {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException('Невірний формат дати');
    }
    return d;
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  /**
   * Обчислити суму знижки промокоду з урахуванням типу.
   * Результат не перевищує cartTotal і округлений до 2 знаків.
   */
  private computeDiscountAmount(
    promo: PromoCodeDocument,
    cartTotal: number,
  ): number {
    let raw = 0;
    if (promo.discountType === PromoDiscountType.PERCENT) {
      raw = (cartTotal * promo.discountValue) / 100;
    } else {
      raw = promo.discountValue;
    }
    const capped = Math.min(raw, cartTotal);
    return Math.round(capped * 100) / 100;
  }

  // ─── Адмін CRUD ───────────────────────────────────────────────────────────

  async create(dto: CreatePromoCodeDto): Promise<PromoCodeDocument> {
    const code = this.normalizeCode(dto.code);

    const existing = await this.promoCodeModel.findOne({ code }).lean();
    if (existing) {
      throw new ConflictException('Промокод з таким кодом уже існує');
    }

    const validFrom = this.parseDateOrNull(dto.validFrom);
    const validTo = this.parseDateOrNull(dto.validTo);
    if (validFrom && validTo && validFrom > validTo) {
      throw new BadRequestException(
        'Дата "діє з" не може бути пізніше за "діє до"',
      );
    }

    return this.promoCodeModel.create({
      code,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderAmount: dto.minOrderAmount ?? 0,
      maxUses: dto.maxUses ?? null,
      validFrom,
      validTo,
      isActive: dto.isActive ?? true,
      description: dto.description ?? '',
    });
  }

  async findAll(query: PromoCodeQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 25;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<PromoCodeDocument> = {};

    if (query.search) {
      const safe = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { code: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
      ];
    }

    if (query.status === 'active') filter.isActive = true;
    if (query.status === 'inactive') filter.isActive = false;

    const sortOrder: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.promoCodeModel
        .find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.promoCodeModel.countDocuments(filter),
    ]);

    return {
      data,
      totalDocuments: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<PromoCodeDocument> {
    const promo = await this.promoCodeModel.findById(id);
    if (!promo) throw new NotFoundException('Промокод не знайдено');
    return promo;
  }

  async update(id: string, dto: UpdatePromoCodeDto): Promise<PromoCodeDocument> {
    const promo = await this.findById(id);

    if (dto.code !== undefined) {
      const nextCode = this.normalizeCode(dto.code);
      if (nextCode !== promo.code) {
        const existing = await this.promoCodeModel.findOne({
          code: nextCode,
          _id: { $ne: promo._id },
        });
        if (existing) {
          throw new ConflictException('Промокод з таким кодом уже існує');
        }
        promo.code = nextCode;
      }
    }

    if (dto.discountType !== undefined) promo.discountType = dto.discountType;
    if (dto.discountValue !== undefined) promo.discountValue = dto.discountValue;
    if (dto.minOrderAmount !== undefined)
      promo.minOrderAmount = dto.minOrderAmount;

    if (dto.maxUses !== undefined) {
      promo.maxUses = dto.maxUses ?? null;
    }

    if (dto.validFrom !== undefined) {
      promo.validFrom = this.parseDateOrNull(dto.validFrom);
    }
    if (dto.validTo !== undefined) {
      promo.validTo = this.parseDateOrNull(dto.validTo);
    }

    if (promo.validFrom && promo.validTo && promo.validFrom > promo.validTo) {
      throw new BadRequestException(
        'Дата "діє з" не може бути пізніше за "діє до"',
      );
    }

    if (dto.isActive !== undefined) promo.isActive = dto.isActive;
    if (dto.description !== undefined) promo.description = dto.description;

    await promo.save();
    return promo;
  }

  async remove(id: string): Promise<{ _id: string }> {
    const res = await this.promoCodeModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Промокод не знайдено');
    return { _id: id };
  }

  // ─── Валідація (без інкременту лічильника) ───────────────────────────────

  /**
   * Повна перевірка промокоду для заданої суми корзини.
   * Кидає BadRequestException з людським повідомленням, якщо щось не так.
   */
  async validateForCart(
    code: string,
    cartTotal: number,
  ): Promise<PromoCodeValidationResult> {
    const normalized = this.normalizeCode(code);
    const promo = await this.promoCodeModel.findOne({ code: normalized });

    if (!promo) {
      throw new BadRequestException('Промокод не знайдено');
    }
    if (!promo.isActive) {
      throw new BadRequestException('Промокод неактивний');
    }

    const now = new Date();
    if (promo.validFrom && now < promo.validFrom) {
      throw new BadRequestException('Промокод ще не активний');
    }
    if (promo.validTo && now > promo.validTo) {
      throw new BadRequestException('Термін дії промокоду минув');
    }

    if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
      throw new BadRequestException(
        'Ліміт активацій промокоду вичерпано',
      );
    }

    if (cartTotal < promo.minOrderAmount) {
      throw new BadRequestException(
        `Мінімальна сума замовлення для цього промокоду: ${promo.minOrderAmount} грн`,
      );
    }

    const discountAmount = this.computeDiscountAmount(promo, cartTotal);

    return { promoCode: promo, discountAmount };
  }

  /**
   * Атомарно збільшити лічильник активацій.
   * Використовує findOneAndUpdate з умовою по maxUses, щоб уникнути гонок.
   * Повертає оновлений документ або null, якщо ліміт уже вичерпано.
   */
  async incrementUses(
    promoId: string,
  ): Promise<PromoCodeDocument | null> {
    return this.promoCodeModel.findOneAndUpdate(
      {
        _id: promoId,
        isActive: true,
        $or: [
          { maxUses: null },
          { $expr: { $lt: ['$currentUses', '$maxUses'] } },
        ],
      },
      { $inc: { currentUses: 1 } },
      { new: true },
    );
  }
}
