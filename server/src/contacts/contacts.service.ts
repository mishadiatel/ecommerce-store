import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contacts, ContactsDocument } from './schemas/contacts.schema';
import { UpsertContactsDto } from './dto/upsert-contacts.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contacts.name)
    private contactsModel: Model<ContactsDocument>,
  ) {}

  /** Публічно: контент для потрібної мови (порожній об'єкт, якщо ще не заведено). */
  async findPublicByLanguage(language: string) {
    const doc = await this.contactsModel.findOne({ language }).lean();
    return (
      doc ?? {
        language,
        salesTitle: '',
        phones: [],
        emails: [],
        productionTitle: '',
        productionAddresses: [],
        socialTitle: '',
        facebookUrl: '',
        instagramUrl: '',
        formTitle: '',
      }
    );
  }

  /** Admin: усі мови. */
  async findAll() {
    return this.contactsModel.find().sort({ language: 1 }).lean();
  }

  async findByLanguage(language: string) {
    const doc = await this.contactsModel.findOne({ language }).lean();
    if (!doc) throw new NotFoundException('Contacts not found');
    return doc;
  }

  /** Upsert per language: створює документ, якщо відсутній, або оновлює наявний. */
  async upsert(dto: UpsertContactsDto) {
    const { language, ...rest } = dto;
    return this.contactsModel
      .findOneAndUpdate(
        { language },
        { $set: { ...rest, language } },
        { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
      )
      .lean();
  }

  async remove(language: string) {
    const res = await this.contactsModel.findOneAndDelete({ language });
    if (!res) throw new NotFoundException('Contacts not found');
    return null;
  }
}
