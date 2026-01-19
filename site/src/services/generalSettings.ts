import { FullSettingsWithTranslations } from '@/types/general';

export async function getGeneralSettings(lang: string): Promise<FullSettingsWithTranslations> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/general-settings/public?lang=${lang}`, {
    next: { tags: ['general-settings'], revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch general settings');
  }

  return res.json();
}