import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateGeneralDto } from './dto/update-general.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  GeneralSettings,
  GeneralSettingsDocument,
} from './schemas/general.schema';
import { Model, Types } from 'mongoose';
import {
  GeneralSettingsTranslation,
  GeneralSettingsTranslationDocument,
} from './schemas/generalTranslation.schema';
import { CreateSettingsTranslationDto } from './dto/create-settings-translation.dto';
import { UpdateSettingsTranslationDto } from './dto/update-settings-translation.dto';
import { YcI18nService } from '../yc-i18n/yc-i18n.service';

@Injectable()
export class GeneralService {
  constructor(
    @InjectModel(GeneralSettings.name)
    private settingsModel: Model<GeneralSettingsDocument>,
    @InjectModel(GeneralSettingsTranslation.name)
    private settingsTranslationModel: Model<GeneralSettingsTranslationDocument>,
    private readonly i18n: YcI18nService,
  ) {}

  private settingsId = process.env.SITE_SETTINGS_ID;

  // Create settings automatically if missing
  async ensureExists() {
    let settings = await this.settingsModel.findOne({
      generalID: this.settingsId,
    });
    if (!settings) {
      settings = await this.settingsModel.create({
        generalID: this.settingsId,
        companyName: 'Default company',
        logo: 'https://placehold.co/600x400.png',
        favicon: 'https://placehold.co/32.png',
        instagram: '',
        facebook: '',
        tiktok: '',
        telegram: '',
        phoneNumber: '',
        email: '',
        mailjetName: '',
        mailjetEmail: '',
      });
    }
    return settings;
  }

  async getSettings() {
    return await this.ensureExists();
  }

  async update(updateDto: UpdateGeneralDto) {
    const settings = await this.settingsModel.findOneAndUpdate(
      { generalID: this.settingsId },
      updateDto,
      { new: true, runValidators: true },
    );

    if (!settings) {
      throw new HttpException('Settings not found', HttpStatus.NOT_FOUND);
    }

    return settings;
  }

  async createSettingsTranslation(dto: CreateSettingsTranslationDto) {
    try {
      const translation = await this.settingsTranslationModel.create({
        ...dto,
        generalID: this.settingsId,
      });
      if (!translation) {
        throw new HttpException(
          'problem with creating translation',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return translation;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 11000) {
        throw new HttpException(
          'Translation for this language already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        'Cannot create translation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllSettingsTranslations() {
    const settingsStanslation = await this.settingsTranslationModel.find();
    if (!settingsStanslation) {
      throw new HttpException(
        'not found settings translations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return settingsStanslation;
  }

  async findOneSettingsTranslation(id: string) {
    const translation = await this.settingsTranslationModel.findById(
      new Types.ObjectId(id),
    );

    if (!translation) {
      throw new HttpException('Translation not found', HttpStatus.NOT_FOUND);
    }

    return translation;
  }

  async updateSettingsTranslation(
    id: string,
    dto: UpdateSettingsTranslationDto,
  ) {
    const updated = await this.settingsTranslationModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      dto,
      { new: true, runValidators: true },
    );

    if (!updated) {
      throw new HttpException('Translation not found', HttpStatus.NOT_FOUND);
    }

    return updated;
  }

  async removeSettingsTranslation(id: string) {
    const deleted = await this.settingsTranslationModel.findByIdAndDelete(
      new Types.ObjectId(id),
    );

    if (!deleted) {
      throw new HttpException(
        'Error deleting translation',
        HttpStatus.NOT_FOUND,
      );
    }

    return null;
  }

  async getPublicSettingsWithTranslation() {
    const lang = this.i18n.lang();
    const settings = await this.settingsModel.aggregate([
      {
        $match: { generalID: this.settingsId },
      },
      {
        $lookup: {
          from: 'generalsettingstranslations',
          let: { generalID: '$generalID' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$generalID', '$$generalID'] },
                    { $eq: ['$language', lang] },
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
    ]);

    if (!settings?.[0]) {
      throw new HttpException('Settings not found', HttpStatus.NOT_FOUND);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return settings[0];
  }
}
