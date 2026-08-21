import { projectApi } from '@/lib/axios';
import { Contacts } from '@/types/contacts';

export const getContactsByLanguage = async (
  language: string,
): Promise<Contacts | undefined> => {
  try {
    // Використовуємо публічний ендпоінт: якщо запис відсутній, повертає порожню структуру
    const { data } = await projectApi.get<Contacts>('/api/contacts/public', {
      params: { language },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const upsertContacts = async (
  payload: Contacts,
): Promise<Contacts | undefined> => {
  try {
    const { data } = await projectApi.put<Contacts>('/api/contacts', payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
