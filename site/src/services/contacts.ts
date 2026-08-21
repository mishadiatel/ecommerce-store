import { projectApi } from '@/lib/axios';

export interface ProductionAddress {
  city: string;
  postcode: string;
  address: string;
}

export interface ContactsBlockData {
  language: string;
  salesTitle: string;
  phones: string[];
  emails: string[];
  productionTitle: string;
  productionAddresses: ProductionAddress[];
  socialTitle: string;
  facebookUrl: string;
  instagramUrl: string;
  formTitle: string;
}

export async function getContactsBlock(
  language: string,
): Promise<ContactsBlockData> {
  const url = `${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/contacts/public?language=${encodeURIComponent(language)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    // Fallback до порожньої структури — щоб сайт не падав
    return {
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
    };
  }
  const raw = (await res.json()) as ContactsBlockData & {
    productionCity?: string;
    productionPostcode?: string;
    productionAddress?: string;
  };
  // Backward-compat: перетворюємо старі поля в масив, якщо новий ще порожній.
  if (
    (!raw.productionAddresses || raw.productionAddresses.length === 0) &&
    (raw.productionCity || raw.productionPostcode || raw.productionAddress)
  ) {
    raw.productionAddresses = [
      {
        city: raw.productionCity ?? '',
        postcode: raw.productionPostcode ?? '',
        address: raw.productionAddress ?? '',
      },
    ];
  }
  return {
    ...raw,
    productionAddresses: raw.productionAddresses ?? [],
  };
}

export interface FeedbackRequestData {
  type: 'contacts';
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  message?: string;
  isAgree: boolean;
}

export async function sendFeedback(payload: FeedbackRequestData) {
  const { data } = await projectApi.post('/api/feedback', payload);
  return data;
}
