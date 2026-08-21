export type CampaignStatus = 'draft' | 'sending' | 'sent' | 'failed';

export interface Campaign {
  _id: string;
  subject: string;
  html: string;
  status: CampaignStatus;
  sentCount: number;
  failedCount: number;
  recipientsCount: number;
  sentAt: string | null;
  lastError: string;
  createdAt: string;
  updatedAt: string;
}
