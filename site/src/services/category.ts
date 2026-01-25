import { FullCategoryWithTranslation } from '@/types/category';
import { notFound } from 'next/navigation';


export async function getPublicCategories(lang: string): Promise<FullCategoryWithTranslation[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/category/public?lang=${lang}`, {
    next: { tags: ['categories'] },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }

  return res.json();
}


export async function getPublicCategoryBySlug(slug: string, lang: string): Promise<FullCategoryWithTranslation> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/category/${slug}/public?lang=${lang}`, {
    next: { tags: ['category-slug'] },
    cache: 'no-store'
  });

  if (!res.ok) {
    // throw new Error('Failed to fetch category');
   return notFound();
  }

  return res.json();
}