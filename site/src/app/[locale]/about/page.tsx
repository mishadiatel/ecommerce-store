import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';
import { getPageBlocks } from '@/services/blocks';
import BlocksList from '@/components/blocks/BlocksList';

export async function generateMetadata({ params }: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const pageInfo = await getPublicPageInfo('about', locale);

  return {
    title: `${pageInfo.title}`,
    description: pageInfo.description,
    robots: {
      follow: pageInfo.follow,
      index: pageInfo.index
    }
  };
}

export default async function AboutPage({ params }: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const pageBlocks = await getPageBlocks('about', locale);
  return (
   <BlocksList blocks={pageBlocks} />
  );
}
