import { projectApi } from '@/lib/axios';
import { GetItemsResponse } from '@/types/getItemsResponse';
import { Campaign } from '@/types/campaign';

export const getCampaigns = async (
  params?: Record<string, string | number>,
): Promise<GetItemsResponse<Campaign> | undefined> => {
  try {
    const { data } = await projectApi.get('/api/campaigns', { params });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCampaign = async (id: string): Promise<Campaign | undefined> => {
  try {
    const { data } = await projectApi.get(`/api/campaigns/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createCampaign = async (payload: {
  subject: string;
  html: string;
}): Promise<Campaign | undefined> => {
  try {
    const { data } = await projectApi.post('/api/campaigns', payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateCampaign = async (
  id: string,
  payload: { subject?: string; html?: string },
): Promise<Campaign | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/campaigns/${id}`, payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const testSendCampaign = async (
  id: string,
  email: string,
): Promise<void> => {
  await projectApi.post(`/api/campaigns/${id}/test`, { email });
};

export const sendCampaign = async (id: string): Promise<{
  campaignId: string;
  status: string;
  recipientsCount: number;
}> => {
  const { data } = await projectApi.post(`/api/campaigns/${id}/send`);
  return data;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await projectApi.delete(`/api/campaigns/${id}`);
};
