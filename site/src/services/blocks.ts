import { Block } from '@/types/blocks';

export async function getPageBlocks(slug: string, lang: string, isTop=false, isBottom=false): Promise<Block<object>[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/block/public/${slug}?lang=${lang}${isTop ? '&isTop=true' : ''}${isBottom ? '&isBottom=true' : ''}`, {
    next: { tags: ['blocks'] },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch page blocks');
  }

  return res.json();
}