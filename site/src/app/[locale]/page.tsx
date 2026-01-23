import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';
import { getGeneralSettings } from '@/services/generalSettings';
import { getPageBlocks } from '@/services/blocks';
import BlocksList from '@/components/blocks/BlocksList';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const pageInfo = await getPublicPageInfo('home', locale);
  const settings = await getGeneralSettings(locale);

  return {
    title: `${pageInfo.title} | ${settings.companyName}`,
    description: pageInfo.description,
    robots: {
      follow: pageInfo.follow,
      index: pageInfo.index,
    },
  };
}

export default async function Home({ params }: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const pageBlocks = await getPageBlocks('home', locale);
  return (
    <BlocksList blocks={pageBlocks} />
  );
}
