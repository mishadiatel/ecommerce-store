import type { Metadata } from 'next';
import { getPublicPageInfo } from '@/services/pages';
import { getPageBlocks } from '@/services/blocks';
import BlocksList from '@/components/blocks/BlocksList';
import { getGeneralSettings } from '@/services/generalSettings';
import BigBreadcrumbs from '@/components/breadcrumbs/BigBreadcrumbsBlock';
import { getContactsBlock } from '@/services/contacts';
import ContactsBlock from '@/components/contacts/ContactsBlock';

export async function generateMetadata({ params }: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const pageInfo = await getPublicPageInfo('contacts', locale);

  return {
    title: `${pageInfo.title}`,
    description: pageInfo.description,
    robots: {
      follow: pageInfo.follow,
      index: pageInfo.index
    }
  };
}

export default async function ContactsPage({ params }: {params: Promise<{locale: string}>}) {
  const { locale } = await params;

  const topBlocks = await getPageBlocks('contacts', locale, true, false);
  const bottomBlocks = await getPageBlocks('contacts', locale, false, true);
  const settings = await getGeneralSettings(locale)
  const pageInfo = await getPublicPageInfo('contacts', locale);
  const contactsData = await getContactsBlock(locale);

  return (
    <>
      <BlocksList blocks={topBlocks} />
      {pageInfo.breadcrumbTitle && (
        <BigBreadcrumbs title={pageInfo.breadcrumbTitle} items={[
          {href: '/', name: settings.companyName},
          {name: pageInfo.breadcrumbTitle}
        ]} />
      )}
      <ContactsBlock data={contactsData} />
      <BlocksList blocks={bottomBlocks} />
    </>
  )
}