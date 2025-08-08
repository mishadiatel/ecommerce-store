import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Faq, FaqDocument } from './schemas/faq.schema';
import {
  FaqTranslation,
  FaqTranslationDocument,
} from './schemas/faq-translation.schema';
import {
  FaqCategory,
  FaqCategoryDocument,
} from './schemas/faq-category.schema';
import {
  FaqCategoryTranslation,
  FaqCategoryTranslationDocument,
} from './schemas/faq-category-translation.schema';
import { CreateFaqTranslationDto } from './dto/create-faq-translation.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { UpdateFaqTranslationDto } from './dto/update-faq-translation.dto';
import { CreateFaqCategoryDto } from './dto/create-faq-category.dto';
import { UpdateFaqCategoryDto } from './dto/update-faq-category.dto';
import { CreateFaqCategoryTranslationDto } from './dto/create-faq-category-translation.dto';
import { UpdateFaqCategoryTranslationDto } from './dto/update-faq-category-translation.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { YcI18nService } from '../yc-i18n/yc-i18n.service';
import { GetFaqQueryDto } from './dto/get-faq-query.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faq.name) private faqModel: Model<FaqDocument>,
    @InjectModel(FaqTranslation.name)
    private faqTranslationModel: Model<FaqTranslationDocument>,
    @InjectModel(FaqCategory.name)
    private faqCategoryModel: Model<FaqCategoryDocument>,
    @InjectModel(FaqCategoryTranslation.name)
    private faqCategoryTranslationModel: Model<FaqCategoryTranslationDocument>,
    private readonly i18n: YcI18nService,
  ) {}

  async createFaq(dto: CreateFaqDto) {
    return this.faqModel.create({
      ...dto,
      ...(dto.faqCategoryId
        ? { faqCategoryId: new Types.ObjectId(dto.faqCategoryId) }
        : {}),
    });
  }

  async updateFaq(id: string, dto: UpdateFaqDto) {
    const updated = await this.faqModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        ...(dto.faqCategoryId
          ? { faqCategoryId: new Types.ObjectId(dto.faqCategoryId) }
          : {}),
      },
      {
        new: true,
      },
    );
    if (!updated)
      throw new HttpException('FAQ not found', HttpStatus.NOT_FOUND);
    return updated;
  }

  async createFaqTranslation(dto: CreateFaqTranslationDto) {
    const faqId = new Types.ObjectId(dto.faqId);
    return this.faqTranslationModel.findOneAndUpdate(
      { faqId: new Types.ObjectId(faqId), lang: dto.lang },
      { ...dto, faqId },
      { upsert: true, new: true, runValidators: true, context: 'query' },
    );
  }

  async updateFaqTranslation(id: string, dto: UpdateFaqTranslationDto) {
    const updated = await this.faqTranslationModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated)
      throw new HttpException(
        'FAQ translation not found',
        HttpStatus.NOT_FOUND,
      );
    return updated;
  }

  async createCategory(dto: CreateFaqCategoryDto) {
    return this.faqCategoryModel.create(dto);
  }

  async updateCategory(id: string, dto: UpdateFaqCategoryDto) {
    return this.faqCategoryModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async createCategoryTranslation(dto: CreateFaqCategoryTranslationDto) {
    const categoryId = new Types.ObjectId(dto.faqCategoryId);
    return this.faqCategoryTranslationModel.findOneAndUpdate(
      { faqCategoryId: categoryId, lang: dto.lang },
      { ...dto, faqCategoryId: categoryId },
      { upsert: true, new: true, runValidators: true, context: 'query' },
    );
  }

  async updateCategoryTranslation(
    id: string,
    dto: UpdateFaqCategoryTranslationDto,
  ) {
    return this.faqCategoryTranslationModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
  }

  async getAllFaqsAdmin(query: GetFaqQueryDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      visible,
    } = query;

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const matchStage: Record<string, any> = {};
    if (visible !== undefined) {
      matchStage.visible = visible === 'true';
    }
    const aggregation = await this.faqModel.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'faqtranslations',
          localField: '_id',
          foreignField: 'faqId',
          as: 'translations',
        },
      },
      {
        $lookup: {
          from: 'faqcategories',
          localField: 'faqCategoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $sort: { [sortBy]: sortDirection },
      },
      { $skip: Number(skip) },
      { $limit: Number(limit) },
    ]);
    const total = await this.faqModel.countDocuments(matchStage);

    return {
      data: aggregation,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async getAllFaqsPublic(query: GetFaqQueryDto) {
    const { page = 1, limit = 10, sortBy = 'order', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;
    const lang = this.i18n.lang();

    const aggregation = await this.faqModel.aggregate([
      {
        $match: { visible: true },
      },
      {
        $lookup: {
          from: 'faqtranslations',
          let: { faqId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$faqId', '$$faqId'] },
                    { $eq: ['$lang', lang] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'translation',
        },
      },
      { $unwind: { path: '$translation', preserveNullAndEmptyArrays: true } },
      {
        $sort: {
          [sortBy]: sortOrder === 'asc' ? 1 : -1,
        },
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit),
      },
    ]);
    const total = await this.faqModel.countDocuments({ visible: true });

    return {
      data: aggregation,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async getAllCategoriesAdmin(query: GetFaqQueryDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      visible,
    } = query;

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const matchStage: Record<string, any> = {};
    if (visible !== undefined) {
      matchStage.visible = visible === 'true';
    }
    const aggregation = await this.faqCategoryModel.aggregate([
      {
        $lookup: {
          from: 'faqcategorytranslations',
          localField: '_id',
          foreignField: 'faqCategoryId',
          as: 'translations',
        },
      },
      {
        $sort: {
          [sortBy]: sortDirection,
        },
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit),
      },
    ]);
    const total = await this.faqCategoryModel.countDocuments();

    return {
      data: aggregation,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async getAllCategoriesPublic(query: GetFaqQueryDto) {
    const { page = 1, limit = 10, sortBy = 'order', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;
    const lang = this.i18n.lang();

    const aggregation = await this.faqCategoryModel.aggregate([
      {
        $match: { visible: true },
      },
      {
        $lookup: {
          from: 'faqcategorytranslations',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$faqCategoryId', '$$categoryId'] },
                    { $eq: ['$lang', lang] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'translation',
        },
      },
      { $unwind: { path: '$translation', preserveNullAndEmptyArrays: true } },
      {
        $sort: {
          [sortBy]: sortOrder === 'asc' ? 1 : -1,
        },
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit),
      },
    ]);
    const total = await this.faqCategoryModel.countDocuments({ visible: true });

    return {
      data: aggregation,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async getFaqsByCategory(categoryId: string, query: GetFaqQueryDto) {
    const { page = 1, limit = 10, sortBy = 'order', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;
    const lang = this.i18n.lang();

    const aggregation = await this.faqModel.aggregate([
      {
        $match: {
          faqCategoryId: new Types.ObjectId(categoryId),
          visible: true,
        },
      },
      {
        $lookup: {
          from: 'faqtranslations',
          let: { faqId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$faqId', '$$faqId'] },
                    { $eq: ['$lang', lang] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'translation',
        },
      },
      { $unwind: { path: '$translation', preserveNullAndEmptyArrays: true } },
      {
        $sort: {
          [sortBy]: sortOrder === 'asc' ? 1 : -1,
        },
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit),
      },
    ]);
    const total = await this.faqModel.countDocuments({
      faqCategoryId: new Types.ObjectId(categoryId),
      visible: true,
    });

    return {
      data: aggregation,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }
}
