import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import {
  BannerTranslation,
  BannerTranslationDocument,
} from './schemas/banner-translation.schema';
import {
  CreateBannerTranslationDto,
  UpdateBannerTranslationDto,
} from './dto/banner-translation.dto';
import { GetBannersQueryDto } from './dto/get-banners-query.dto';
import { YcI18nService } from '../yc-i18n/yc-i18n.service';

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    @InjectModel(BannerTranslation.name)
    private translationModel: Model<BannerTranslationDocument>,
    private readonly i18n: YcI18nService,
  ) {
  }

  async create(dto: CreateBannerDto) {
    const banner = await this.bannerModel.create(dto);
    if (!banner) {
      throw new HttpException(
        'not created banner',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return banner;
  }

  async addTranslation(
    dto: CreateBannerTranslationDto,
  ): Promise<BannerTranslation> {
    const bannerTranslation = await this.translationModel.findOneAndUpdate(
      { bannerId: dto.bannerId, lang: dto.lang },
      {
        ...dto,
        bannerId: new Types.ObjectId(dto.bannerId),
      },
      { upsert: true, new: true },
    );

    if (!bannerTranslation) {
      throw new HttpException(
        'not created banner translation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return bannerTranslation;
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.bannerModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!banner) {
      throw new HttpException('not found banner', HttpStatus.NOT_FOUND);
    }
    return banner;
  }

  async updateTranslation(id: string, dto: UpdateBannerTranslationDto) {
    const bannerTranslation = await this.translationModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        bannerId: new Types.ObjectId(dto.bannerId),
      },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!bannerTranslation) {
      throw new HttpException(
        'not found banner translation',
        HttpStatus.NOT_FOUND,
      );
    }
    return bannerTranslation;
  }

  async delete(id: string) {
    await this.translationModel.deleteMany({ bannerId: id });
    return this.bannerModel.findByIdAndDelete(id);
  }

  async getAllAdmin(query: GetBannersQueryDto) {
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

    const aggregation = await this.bannerModel.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'bannertranslations',
          localField: '_id',
          foreignField: 'bannerId',
          as: 'translations',
        },
      },
      {
        $sort: { [sortBy]: sortDirection },
      },
      { $skip: Number(skip) },
      { $limit: Number(limit) },
    ]);

    const total = await this.bannerModel.countDocuments(matchStage);

    return {
      data: aggregation,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async getAllPublic(query: GetBannersQueryDto) {
    const { page = 1, limit = 10, sortBy = 'order', sortOrder = 'asc' } = query;

    const skip = (page - 1) * limit;
    const lang = this.i18n.lang();

    const aggregation = await this.bannerModel.aggregate([
      {
        $match: { visible: true },
      },
      {
        $lookup: {
          from: 'bannertranslations',
          let: { bannerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$bannerId', '$$bannerId'] },
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
      {
        $unwind: {
          path: '$translation',
          preserveNullAndEmptyArrays: true,
        },
      },
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

    const total = await this.bannerModel.countDocuments({ visible: true });

    return {
      data: aggregation,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }
}
