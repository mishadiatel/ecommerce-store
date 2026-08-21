import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async create(dto: CreateReviewDto) {
    return this.reviewModel.create({
      productId: new Types.ObjectId(dto.productId),
      language: dto.language ?? 'ua',
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      rating: dto.rating,
      comment: dto.comment.trim(),
      isVisible: dto.isVisible ?? true,
    });
  }

  async findAllAdmin(query: ReviewQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 25;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ReviewDocument> = {};
    if (query.productId && Types.ObjectId.isValid(query.productId)) {
      filter.productId = new Types.ObjectId(query.productId);
    }
    if (query.language) filter.language = query.language;
    if (query.isVisible === 'true') filter.isVisible = true;
    if (query.isVisible === 'false') filter.isVisible = false;
    if (query.search) {
      const safe = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { firstName: { $regex: safe, $options: 'i' } },
        { lastName: { $regex: safe, $options: 'i' } },
        { comment: { $regex: safe, $options: 'i' } },
      ];
    }

    const [data, totalDocuments] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.reviewModel.countDocuments(filter),
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
   * Публічний список відгуків для товару у певній мові.
   * Не пагінуємо — відгуків зазвичай мало на товар; UI ховає більше 5-10 під кнопку.
   */
  async findPublicByProduct(productId: string, language: string) {
    if (!Types.ObjectId.isValid(productId)) return { data: [], averageRating: 0, count: 0 };
    const filter: FilterQuery<ReviewDocument> = {
      productId: new Types.ObjectId(productId),
      language,
      isVisible: true,
    };
    const [data, avg] = await Promise.all([
      this.reviewModel.find(filter).sort({ createdAt: -1 }).lean(),
      this.reviewModel.aggregate<{ _id: null; avg: number; count: number }>([
        { $match: filter },
        {
          $group: {
            _id: null,
            avg: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);
    return {
      data,
      averageRating: Math.round((avg[0]?.avg ?? 0) * 100) / 100,
      count: avg[0]?.count ?? 0,
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Review not found');
    const doc = await this.reviewModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Review not found');
    return doc;
  }

  async update(id: string, dto: UpdateReviewDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Review not found');
    const update: Partial<Review> = {};
    if (dto.language !== undefined) update.language = dto.language;
    if (dto.firstName !== undefined) update.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) update.lastName = dto.lastName.trim();
    if (dto.rating !== undefined) update.rating = dto.rating;
    if (dto.comment !== undefined) update.comment = dto.comment.trim();
    if (dto.isVisible !== undefined) update.isVisible = dto.isVisible;
    if (dto.productId !== undefined) {
      update.productId = new Types.ObjectId(dto.productId);
    }
    const updated = await this.reviewModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw new NotFoundException('Review not found');
    return updated;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Review not found');
    const deleted = await this.reviewModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Review not found');
    return null;
  }
}
