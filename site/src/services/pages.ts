import { Page } from '@/types/pages';

export async function getPublicPageInfo(slug: string, lang: string): Promise<Page> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/pages/getPublicPage/${slug}?lang=${lang}`, {
    next: { tags: ['page-info'], revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch page info');
  }

  const pageInfo: Array<Page> = await res.json();

  return pageInfo[0];
}