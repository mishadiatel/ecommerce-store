import { projectApi } from '@/lib/axios';
import { MailTemplate } from '@/types/mailTemplate';

export const getMailTemplate = async (queryParams?: Record<string, string | number>): Promise<MailTemplate[] | undefined> => {
  try {
    const { data } = await projectApi.get('/api/mail-template', { params: queryParams });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createMailTemplate = async (mailTemplateData: Partial<MailTemplate>): Promise<MailTemplate | undefined> => {
  try {
    const { data } = await projectApi.post('/api/mail-template', mailTemplateData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;

  }
};

export const updateMailTemplate = async (id: string, mailTemplateData: Partial<MailTemplate>): Promise<MailTemplate | undefined> => {
  try {
    const { data } = await projectApi.patch(`/api/mail-template/${id}`, mailTemplateData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPublicMailTemplate = async (slug: string): Promise<MailTemplate | undefined> => {
  try {
    const { data } = await projectApi.get(`/api/mail-template/getPublicMailTemplate/${slug}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteMailTemplate = async (id: string): Promise<null | undefined> => {
  try {
    const { data } = await projectApi.delete(`/api/mail-template/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};