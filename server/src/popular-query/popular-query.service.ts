import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  PopularQuery,
  PopularQueryDocument,
} from './schemas/popular-query.schema';
import { CreatePopularQueryDto } from './dto/create-popular-query.dto';
import { UpdatePopularQueryDto } from './dto/update-popular-query.dto';
import { PopularQueryQueryDto } from './dto/popular-query-query.dto';

@Injectable()
export class PopularQueryService {
  constructor(
    @InjectModel(PopularQuery.name)
    private popularQueryModel: Model<PopularQueryDocument>,
  ) {}

  async create(dto: CreatePopularQueryDto) {
    try {
      const created = await this.popularQueryModel.create({
        queryText: dto.queryText.trim(),
        language: dto.language ?? 'ua',
        visible: dto.visible ?? true,
      });
      return created;
    } catch (err) {
      // Дубль (queryText + language)
      const anyErr = err as { code?: number };
      if (anyErr?.code === 11000) {
        throw new BadRequestException(
          'Такий популярний запит для цієї мови вже існує.',
        );
      }
      throw new HttpException(
        'Не вдалося створити популярний запит.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(query: PopularQueryQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 25;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<PopularQueryDocument> = {};

    if (query.search) {
      const safe = query.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.queryText = { $regex: safe, $options: 'i' };
    }

    if (query.language) {
      filter.language = query.language;
    }

    if (query.visible === 'true') filter.visible = true;
    if (query.visible === 'false') filter.visible = false;

    const [data, totalDocuments] = await Promise.all([
      this.popularQueryModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.popularQueryModel.countDocuments(filter),
    ]);

    return {
      data,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      page,
      limit,
    };
  }

  /**
   * Публічний список видимих запитів для заданої мови.
   * За замовчуванням віддає до 20 запитів.
   */
  async findPublicByLanguage(language: string, limit: number = 20) {
    return this.popularQueryModel
      .find({ language, visible: true })
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(limit, 1), 100))
      .lean();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Популярний запит не знайдено');
    }
    const item = await this.popularQueryModel.findById(id);
    if (!item) throw new NotFoundException('Популярний запит не знайдено');
    return item;
  }

  async update(id: string, dto: UpdatePopularQueryDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Популярний запит не знайдено');
    }
    try {
      const updated = await this.popularQueryModel.findByIdAndUpdate(
        id,
        {
          ...(dto.queryText !== undefined
            ? { queryText: dto.queryText.trim() }
            : {}),
          ...(dto.language !== undefined ? { language: dto.language } : {}),
          ...(dto.visible !== undefined ? { visible: dto.visible } : {}),
        },
        { new: true, runValidators: true },
      );
      if (!updated) throw new NotFoundException('Популярний запит не знайдено');
      return updated;
    } catch (err) {
      const anyErr = err as { code?: number };
      if (anyErr?.code === 11000) {
        throw new BadRequestException(
          'Такий популярний запит для цієї мови вже існує.',
        );
      }
      throw err;
    }
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Популярний запит не знайдено');
    }
    const deleted = await this.popularQueryModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Популярний запит не знайдено');
    return null;
  }
}
