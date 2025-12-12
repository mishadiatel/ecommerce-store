import { projectApi } from '@/lib/axios';
import { GeneralSettings } from '@/types/general';


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