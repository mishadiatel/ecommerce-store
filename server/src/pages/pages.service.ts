import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Page, PageDocument } from './schemas/page.schema';
import { YcI18nService } from '../yc-i18n/yc-i18n.service';
import { APIFeatures } from '../utils/APIFeature';

@Injectable()
export class PagesService {
  constructor(
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
    private readonly i18n: YcI18nService,
  ) {}

  async create(createPageDto: CreatePageDto) {
    const page = await this.pageModel.create(createPageDto);
    if (!page) {
      throw new HttpException(
        'problem with creating page',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return page;
  }

  async findAll(query: any) {
    const pagesQuery = new APIFeatures(this.pageModel.find(), query)
      .search(['slug', 'language', 'title'])
      .filter()
      .sort();

    return pagesQuery.query;
  }

  async findOne(id: string) {
    const page = await this.pageModel.findById(new Types.ObjectId(id));
    if (!page) {
      throw new HttpException('not found page', HttpStatus.NOT_FOUND);
    }
    return page;
  }

  async findPublicPage(slug: string) {
    const page = await this.pageModel.find({
      slug,
      language: this.i18n.lang(),
    });
    if (!page) {
      throw new HttpException('not found page', HttpStatus.NOT_FOUND);
    }
    return page;
  }

  async update(id: string, updatePageDto: UpdatePageDto) {
    const page = await this.pageModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updatePageDto,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!page) {
      throw new HttpException('not found page', HttpStatus.NOT_FOUND);
    }
    return page;
  }

  async remove(id: string) {
    const page = await this.pageModel.findByIdAndDelete(new Types.ObjectId(id));
    if (!page) {
      throw new HttpException('not found page', HttpStatus.NOT_FOUND);
    }
    return null;
  }
}
