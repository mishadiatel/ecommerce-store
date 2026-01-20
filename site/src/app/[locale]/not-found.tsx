
import { getLocale } from 'next-intl/server';
import { getPageBlocks } from '@/services/blocks';
import BlocksList from '@/components/blocks/BlocksList';



export default async function NotFound() {
  const locale = await getLocale();
  const pageBlocks = await getPageBlocks('not-found', locale)

  return (
   <>
     <BlocksList blocks={pageBlocks} />
   </>
  )

}