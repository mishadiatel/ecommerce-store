import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateGeneralDto } from './dto/update-general.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  GeneralSettings,
  GeneralSettingsDocument,
} from './schemas/general.schema';
import { Model } from 'mongoose';

@Injectable()
export class GeneralService {
  constructor(
    @InjectModel(GeneralSettings.name)
    private settingsModel: Model<GeneralSettingsDocument>,
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
        logo: 'https://placehold.co/600x400',
        favicon: 'https://placehold.co/32',
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
}
