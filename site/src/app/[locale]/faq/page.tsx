import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';
import { getPageBlocks } from '@/services/blocks';
import BlocksList from '@/components/blocks/BlocksList';

export async function generateMetadata({ params }: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const pageInfo = await getPublicPageInfo('faq', locale);

  return {
    title: `${pageInfo.title}`,
    description: pageInfo.description,
    robots: {
      follow: pageInfo.index,
      index: pageInfo.index
    }
  };
}

export default async function FaqPage({ params }: {params: Promise<{locale: string}>}) {
  const { locale } = await params;

  const topBlocks = await getPageBlocks('faq', locale, true, false);
  const bottomBlocks = await getPageBlocks('faq', locale, false, true);

  return (
    <>
      <BlocksList blocks={topBlocks} />
      <div>here will be breadcrumbs</div>
      <BlocksList blocks={bottomBlocks} />
    </>
  )
}