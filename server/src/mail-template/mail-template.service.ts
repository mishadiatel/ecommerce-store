import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { YcI18nService } from '../yc-i18n/yc-i18n.service';
import {
  MailTemplate,
  MailTemplateDocument,
} from './schemas/mail-template.schema';
import { APIFeatures } from '../utils/APIFeature';
import { CreateMailTemplateDto } from './dto/create-mail-template.dto';
import { UpdateMailTemplateDto } from './dto/update-mail-template.dto';
import { BaseQueryDto } from '../utils/base-query.dto';

@Injectable()
export class MailTemplateService {
  constructor(
    @InjectModel(MailTemplate.name)
    private mailTemplateModel: Model<MailTemplateDocument>,
    private readonly i18n: YcI18nService,
  ) {}

  async create(createMailTemplateDto: CreateMailTemplateDto) {
    const mailTemplate = await this.mailTemplateModel.create(
      createMailTemplateDto,
    );
    if (!mailTemplate) {
      throw new HttpException(
        'problem with creating mail template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return mailTemplate;
  }

  async findAll(query: BaseQueryDto) {
    const mailTemplateQuery = new APIFeatures(
      this.mailTemplateModel.find(),
      query,
    )
      .search(['slug', 'language', 'subject'])
      .filter()
      .sort();
    const totalDocuments = await this.mailTemplateModel.countDocuments(
      mailTemplateQuery.query.getQuery(),
    );
    const paginatedQuery = mailTemplateQuery.paginate();
    const mailTemplatesData = await paginatedQuery.query;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const totalPages = Math.ceil(totalDocuments / limit);

    return {
      data: mailTemplatesData,
      totalPages,
      totalDocuments,
    };
  }

  async findOne(id: string) {
    const mailTemplate = await this.mailTemplateModel.findById(
      new Types.ObjectId(id),
    );
    if (!mailTemplate) {
      throw new HttpException('not found mail template', HttpStatus.NOT_FOUND);
    }
    return mailTemplate;
  }

  async findPublicMailTemplate(slug: string) {
    const mailTemplate = await this.mailTemplateModel.findOne({
      slug,
      language: this.i18n.lang(),
    });
    if (!mailTemplate) {
      throw new HttpException('not found mail template', HttpStatus.NOT_FOUND);
    }
    return mailTemplate;
  }

  async update(id: string, updateMailTemplateDto: UpdateMailTemplateDto) {
    const mailTemplate = await this.mailTemplateModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updateMailTemplateDto,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!mailTemplate) {
      throw new HttpException('not found mail template', HttpStatus.NOT_FOUND);
    }
    return mailTemplate;
  }

  async remove(id: string) {
    const mailTemplate = await this.mailTemplateModel.findByIdAndDelete(
      new Types.ObjectId(id),
    );
    if (!mailTemplate) {
      throw new HttpException('not found mail template', HttpStatus.NOT_FOUND);
    }
    return null;
  }
}
