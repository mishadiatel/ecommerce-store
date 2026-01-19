import { Block } from '@/types/blocks';

export async function getPageBlocks(slug: string, lang: string): Promise<Block<object>[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/block/public/${slug}?lang=${lang}`, {
    next: { tags: ['blocks'], revalidate: 3600 },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch page blocks');
  }

  return res.json();
}