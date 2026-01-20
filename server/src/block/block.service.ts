import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Block, BlockDocument } from './schemas/block.schema';
import { Model, Types } from 'mongoose';
import { YcI18nService } from '../yc-i18n/yc-i18n.service';
import { APIFeatures } from '../utils/APIFeature';
import { BaseQueryDto } from '../utils/base-query.dto';

@Injectable()
export class BlockService {
  constructor(
    @InjectModel(Block.name)
    private readonly blockModel: Model<BlockDocument>,
    private readonly i18n: YcI18nService,
  ) {
  }

  async create(createDto: CreateBlockDto) {
    const block = await this.blockModel.create(createDto);
    if (!block) {
      throw new HttpException(
        'problem with creating page block',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return block;
  }

  async findAll(query: BaseQueryDto) {
    const blocksQuery = new APIFeatures(this.blockModel.find(), query)
      .search(['pages', 'languages', 'blockType'])
      .filter()
      .sort();
    const totalDocuments = await this.blockModel.countDocuments(
      blocksQuery.query.getQuery(),
    );
    const paginatedQuery = blocksQuery.paginate();
    const blocks = await paginatedQuery.query;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const totalPages = Math.ceil(totalDocuments / limit);

    return {
      data: blocks,
      totalPages,
      totalDocuments,
    };
  }

  async findOne(id: string) {
    const block = await this.blockModel.findById(new Types.ObjectId(id));
    if (!block) {
      throw new HttpException('not found page block', HttpStatus.NOT_FOUND);
    }
    return block;
  }

  async update(id: string, updateDto: UpdateBlockDto) {
    const block = await this.blockModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updateDto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!block) {
      throw new HttpException('not found page block', HttpStatus.NOT_FOUND);
    }
    return block;
  }

  async remove(id: string) {
    const block = await this.blockModel.findByIdAndDelete(
      new Types.ObjectId(id),
    );
    if (!block) {
      throw new HttpException('not found page block', HttpStatus.NOT_FOUND);
    }
    return null;
  }

  async findPublicBlocks(page: string, query: BaseQueryDto) {
    const lang = this.i18n.lang();

    return this.blockModel
      .find({
        pages: page,
        languages: lang,
        visible: true,
        ...(query.isTop === 'true' ? { isTop: true } : {}),
        ...(query.isBottom === 'true' ? { isBottom: true } : {}),
      })
      .sort({ order: 1 });
  }
}
