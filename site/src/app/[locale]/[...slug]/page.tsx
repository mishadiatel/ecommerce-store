import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';

export async function generateMetadata({ params }: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const pageInfo = await getPublicPageInfo('not-found', locale);
  return {
    title: pageInfo.title,
    description: pageInfo.description,
    robots: {
      follow: pageInfo.index,
      index: pageInfo.index
    }
  };
}

export default function CatchAllNotFoundPages() {
  notFound();
}