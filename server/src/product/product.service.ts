import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { YcI18nService } from '../yc-i18n/yc-i18n.service';

import { BaseQueryDto } from '../utils/base-query.dto';
import { AggregateFinalResult } from '../utils/aggregate-result';

import { Product, ProductDocument } from './schema/product.schema';
import {
  ProductTranslation,
  ProductTranslationDocument,
} from './schema/product-translation.schema';
import { FullProductWithTranslations } from './interface/product.interface';
import {
  CreateProductDto,
  CreateProductTranslationDto,
} from './dto/create-product.dto';
import {
  UpdateProductDto,
  UpdateProductTranslationDto,
} from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductTranslation.name)
    private readonly translationModel: Model<ProductTranslationDocument>,
    private readonly i18n: YcI18nService,
  ) {}

  async createProduct(dto: CreateProductDto) {
    return this.productModel.create({
      ...dto,
      categoryId: new Types.ObjectId(dto.categoryId),
    });
  }

  async findAllProductsAdmin(query: BaseQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const match: {
      slug?: {
        $regex?: string;
        $options?: string;
      };
      categoryId?: Types.ObjectId;
    } = {};

    /* 🔍 SEARCH BY SLUG */
    if (query.search) {
      match.slug = {
        $regex: query.search.trim().toLowerCase(),
        $options: 'i',
      };
    }

    if (query.category) {
      match.categoryId = new Types.ObjectId(query.category);
    }

    // const pipeline = ;
    const result: AggregateFinalResult<FullProductWithTranslations> =
      await this.productModel.aggregate([
        { $match: match },
        { $sort: { order: 1 } },

        {
          $lookup: {
            from: 'producttranslations',
            localField: '_id',
            foreignField: 'productId',
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

  async findAdminProductById(id: string) {
    const data: FullProductWithTranslations[] =
      await this.productModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'producttranslations',
            localField: '_id',
            foreignField: 'productId',
            as: 'translations',
          },
        },
      ]);

    if (!data) {
      throw new NotFoundException('not found product');
    }
    return data[0];
  }

  async findPublicProductBySlug(slug: string) {
    const data: FullProductWithTranslations[] =
      await this.productModel.aggregate([
        {
          $match: {
            slug,
          },
        },
        {
          $lookup: {
            from: 'producttranslations',
            let: { productId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$productId', '$$productId'] },
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
      throw new NotFoundException('not found product');
    }
    return data[0];
  }

  async findPublicProductById(id: string) {
    const data: FullProductWithTranslations[] =
      await this.productModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'producttranslations',
            let: { productId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$productId', '$$productId'] },
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
      throw new NotFoundException('not found product');
    }
    return data[0];
  }

  async findAllPublic(query: BaseQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const match: {
      isVisible?: boolean;
      categoryId?: Types.ObjectId;
    } = {
      isVisible: true,
    };

    if (query.category) {
      match.categoryId = new Types.ObjectId(query.category);
    }

    const result: AggregateFinalResult<FullProductWithTranslations> =
      await this.productModel.aggregate([
        {
          $match: match,
        },

        /* 🔗 ПІДТЯГУЄМО ВСІ ПЕРЕКЛАДИ */
        {
          $lookup: {
            from: 'producttranslations',
            localField: '_id',
            foreignField: 'productId',
            as: 'translations',
          },
        },

        /* 🔍 SEARCH ПО ВСІХ ПЕРЕКЛАДАХ */
        ...(query.search
          ? [
              {
                $match: {
                  'translations.title': {
                    $regex: query.search.trim(),
                    $options: 'i',
                  },
                },
              },
            ]
          : []),

        /* 🌍 ЗАЛИШАЄМО ТІЛЬКИ ПЕРЕКЛАД ПОТОЧНОЇ МОВИ */
        {
          $addFields: {
            translations: {
              $filter: {
                input: '$translations',
                as: 't',
                cond: { $eq: ['$$t.lang', this.i18n.lang()] },
              },
            },
          },
        },

        /* ❌ ВІДСІКАЄМО БЕЗ ПЕРЕКЛАДУ */
        {
          $match: {
            translations: { $ne: [] },
          },
        },

        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            meta: [{ $count: 'total' }],
          },
        },
      ]);

    if (!result) {
      throw new NotFoundException('not found category');
    }

    const total = result[0]?.meta[0]?.total || 0;
    const data = result[0]?.data || [];
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      totalDocuments: total,
      totalPages,
    };
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.productModel.findByIdAndUpdate(
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
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async deleteProduct(id: string) {
    await this.translationModel.deleteMany({
      productId: new Types.ObjectId(id),
    });

    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Product not found');

    return null;
  }

  async createTranslation(dto: CreateProductTranslationDto) {
    return this.translationModel.create({
      ...dto,
      productId: new Types.ObjectId(dto.productId),
    });
  }

  async updateTranslation(id: string, dto: UpdateProductTranslationDto) {
    const translation = await this.translationModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        productId: new Types.ObjectId(dto.productId),
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
