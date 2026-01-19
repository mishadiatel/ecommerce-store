export interface GeneralSettings {
  _id: string;
  generalID: string;
  companyName: string;
  logo: string;
  favicon: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  telegram?: string;
  phoneNumber?: string;
  email?: string;
  mailjetName?: string;
  mailjetEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneralSettingsTranslation {
  _id: string;
  generalID: string;
  language: string;
  schedule: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullSettingsWithTranslations {
  _id: string;
  generalID: string;
  companyName: string;
  logo: string;
  favicon: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  telegram?: string;
  phoneNumber?: string;
  email?: string;
  mailjetName?: string;
  mailjetEmail?: string;
  createdAt: string;
  updatedAt: string;

  translation: GeneralSettingsTranslation;
}