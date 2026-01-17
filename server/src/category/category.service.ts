import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schema/category.schema';
import { Model, Types } from 'mongoose';
import {
  CategoryTranslation,
  CategoryTranslationDocument,
} from './schema/category-translation.schema';
import {
  CreateCategoryDto,
  CreateCategoryTranslationDto,
} from './dto/create-category.dto';
import {
  UpdateCategoryDto,
  UpdateCategoryTranslationDto,
} from './dto/update-category.dto';
import { BaseQueryDto } from '../utils/base-query.dto';
import { AggregateFinalResult } from '../utils/aggregate-result';
import { FullCategoryWithTranslation } from './interface/category.interface';
import { YcI18nService } from '../yc-i18n/yc-i18n.service';
import { Product, ProductDocument } from '../product/schema/product.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(CategoryTranslation.name)
    private readonly translationModel: Model<CategoryTranslationDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly i18n: YcI18nService,
  ) {}

  async createCategory(dto: CreateCategoryDto) {
    return this.categoryModel.create(dto);
  }

  async findAllCategoriesAdmin(query: BaseQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const match: {
      slug?: {
        $regex?: string;
        $options?: string;
      };
    } = {};

    /* 🔍 SEARCH BY SLUG */
    if (query.search) {
      match.slug = {
        $regex: query.search.trim().toLowerCase(),
        $options: 'i',
      };
    }

    /* 🔃 SORT */

    // const pipeline = ;
    const result: AggregateFinalResult<FullCategoryWithTranslation> =
      await this.categoryModel.aggregate([
        { $match: match },
        { $sort: { order: 1 } },

        {
          $lookup: {
            from: 'categorytranslations',
            localField: '_id',
            foreignField: 'categoryId',
            as: 'translations',
          },
        },

        /* 📄 PAGINATION */
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            meta: [{ $count: 'total' }],
          },
        },
      ]);

    const total = result[0]?.meta[0]?.total || 0;
    const data = result[0]?.data || [];
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      totalDocuments: total,
      totalPages,
    };
  }

  async findAllAdminCategories() {
    const data: FullCategoryWithTranslation[] =
      await this.categoryModel.aggregate([
        {
          $lookup: {
            from: 'categorytranslations',
            let: { categoryId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$categoryId', '$$categoryId'] },
                      { $eq: ['$lang', this.i18n.lang()] },
                    ],
                  },
                },
              },
            ],
            as: 'translations',
          },
        },
      ]);

    if (!data) {
      throw new NotFoundException('not found category');
    }
    return data;
  }

  async findAdminCategoryById(id: string) {
    const data: FullCategoryWithTranslation[] =
      await this.categoryModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'categorytranslations',
            localField: '_id',
            foreignField: 'categoryId',
            as: 'translations',
          },
        },
      ]);

    if (!data) {
      throw new NotFoundException('not found category');
    }
    return data[0];
  }

  async findPublicCategoryBySlug(slug: string) {
    const data: FullCategoryWithTranslation[] =
      await this.categoryModel.aggregate([
        {
          $match: {
            slug,
          },
        },
        {
          $lookup: {
            from: 'categorytranslations',
            let: { categoryId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$categoryId', '$$categoryId'] },
                      { $eq: ['$lang', this.i18n.lang()] },
                    ],
                  },
                },
              },
            ],
            as: 'translations',
          },
        },
      ]);

    if (!data) {
      throw new NotFoundException('not found category');
    }
    return data[0];
  }

  async findPublicCategoryById(id: string) {
    const data: FullCategoryWithTranslation[] =
      await this.categoryModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'categorytranslations',
            let: { categoryId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$categoryId', '$$categoryId'] },
                      { $eq: ['$lang', this.i18n.lang()] },
                    ],
                  },
                },
              },
            ],
            as: 'translations',
          },
        },
      ]);

    if (!data) {
      throw new NotFoundException('not found category');
    }
    return data[0];
  }

  async findAllPublic() {
    const data: FullCategoryWithTranslation[] =
      await this.categoryModel.aggregate([
        {
          $match: {
            isVisible: true,
          },
        },
        {
          $lookup: {
            from: 'categorytranslations',
            let: { categoryId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$categoryId', '$$categoryId'] },
                      { $eq: ['$lang', this.i18n.lang()] },
                    ],
                  },
                },
              },
            ],
            as: 'translations',
          },
        },
      ]);

    if (!data) {
      throw new NotFoundException('not found category');
    }
    return data;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async deleteCategory(id: string) {
    const productsCount = await this.productModel.countDocuments({
      categoryId: new Types.ObjectId(id),
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with assigned products',
      );
    }
    await this.translationModel.deleteMany({
      categoryId: new Types.ObjectId(id),
    });

    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Category not found');

    return null;
  }

  async createTranslation(dto: CreateCategoryTranslationDto) {
    return this.translationModel.create({
      ...dto,
      categoryId: new Types.ObjectId(dto.categoryId),
    });
  }

  async updateTranslation(id: string, dto: UpdateCategoryTranslationDto) {
    const translation = await this.translationModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        categoryId: new Types.ObjectId(dto.categoryId),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!translation) throw new NotFoundException('Translation not found');
    return translation;
  }

  async deleteTranslation(id: string) {
    const result = await this.translationModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Translation not found');

    return null;
  }
}
