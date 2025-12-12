import { projectApi } from '@/lib/axios';
import { GeneralSettings, GeneralSettingsTranslation } from '@/types/general';

export const getSettings = async (): Promise<GeneralSettings | undefined> => {
  try {
    const { data } = await projectApi.get('/api/general-settings');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const updateSettings = async (settingsData: Partial<GeneralSettings>): Promise<GeneralSettings | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/general-settings`, settingsData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSettingsTranslations = async (): Promise<GeneralSettingsTranslation[] | undefined> => {
  try {
    const { data } = await projectApi.get('/api/general-settings/translation');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createSettingsTranslations = async (pageData: Partial<GeneralSettingsTranslation>): Promise<GeneralSettingsTranslation | undefined> => {
  try {
    const { data } = await projectApi.post('/api/general-settings/translation', pageData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;

  }
};

export const updateSettingsTranslations = async (id: string, pageData: Partial<GeneralSettingsTranslation>): Promise<GeneralSettingsTranslation | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/general-settings/translation/${id}`, pageData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteSettingsTranslations = async (id: string): Promise<null | undefined> => {
  try {
    const { data } = await projectApi.delete(`/api/general-settings/translation/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};