import { FullCategoryWithTranslation } from '@/types/category';


export async function getPublicCategories(lang: string): Promise<FullCategoryWithTranslation[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/category/public?lang=${lang}`, {
    next: { tags: ['general-settings'] },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch categoires');
  }

  return res.json();
}