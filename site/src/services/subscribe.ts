import { projectApi } from '@/lib/axios';

export interface SubscribePayload {
  email: string;
  source?: string;
  locale?: string;
}

export async function subscribeToNewsletter(payload: SubscribePayload) {
  const { data } = await projectApi.post('/api/subscribers', payload);
  return data;
}
